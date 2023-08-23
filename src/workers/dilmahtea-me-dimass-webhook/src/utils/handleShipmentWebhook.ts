import { ENV, Shipment } from "../types";

import { reply } from "../../../../utils/createModuleWorker";

import sendInvoice from "./sendInvoice";
import createGoodsDelivery from "./createGoodsDelivery";
import sendErrorEmail from "../../../../utils/sendErrorEmail";
import fetchExactAPIConstructor from "../../../../utils/fetchExactAPIConstructor";

export default async function handleShipmentWebhook(
  env: ENV,
  shipment: Shipment
) {
  const fetchExactAPI = fetchExactAPIConstructor(env);

  const orderNumber = +shipment.order.order_number;

  if (
    (env.ENVIRONMENT === "PRODUCTION" && orderNumber < 20000) ||
    Number.isNaN(orderNumber)
  ) {
    return reply({ success: null, message: "Irrelevant order" }, 200);
  }

  const { state, sub_state } = shipment;

  if (state === 15 && [null, 1530].includes(sub_state)) {
    const salesOrder = await fetchExactAPI(
      "GET",
      `/salesorder/SalesOrders?$filter=OrderNumber eq ${orderNumber}&$select=OrderID,SalesOrderLines`
    );

    const orderID = salesOrder.feed.entry.content["m:properties"]["d:OrderID"];

    const [shipment_colli] = shipment.shipment_colli,
      {
        tracking_url,
        courier_code,
        courier_reference: TrackingNumber,
      } = shipment_colli;

    const shippingMethod = await fetchExactAPI(
      "GET",
      `/sales/ShippingMethods?$filter=Code eq '${courier_code}'&$select=ID`
    );

    const shippingMethodID =
      shippingMethod.feed.entry.content["m:properties"]["d:ID"];

    try {
      if (sub_state === null) {
        await sendInvoice(
          orderID,
          orderNumber,
          tracking_url,
          shippingMethodID,
          fetchExactAPI,
          env
        ).catch((error) => {
          error.creation = "invoice";

          throw error;
        });

        return reply({ success: true, message: "Sales invoice sent" }, 200);
      } else {
        await createGoodsDelivery(
          orderID,
          orderNumber,
          TrackingNumber,
          shippingMethodID,
          fetchExactAPI
        ).catch((error) => {
          error.creation = "goods delivery";

          throw error;
        });

        return reply(
          { success: true, message: "Delivery status updated" },
          200
        );
      }
    } catch (error) {
      error.platform = "Exact";

      await sendErrorEmail(error, { orderNumber }, env);
    }
  }

  return reply({ success: false, message: "Invalid shipment state" }, 400);
}
