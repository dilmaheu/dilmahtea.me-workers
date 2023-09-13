import type { Shipment, AcceptedShipmentEvents } from "../types";

import env from "../env";

import { reply } from "../../../../utils/createModuleWorker";

import sendInvoice from "./sendInvoice";
import createGoodsDelivery from "./createGoodsDelivery";

import fetchExactAPI from "../../../../utils/fetchExactAPI";
import sendErrorEmail from "../../../../utils/sendErrorEmail";

export default async function handleShipmentWebhook(
  event: AcceptedShipmentEvents,
  shipment: Shipment,
) {
  const orderNumber = +shipment.order.order_number;

  if (
    ((env.ENVIRONMENT as string) === "PRODUCTION" && orderNumber < 20000) ||
    Number.isNaN(orderNumber)
  ) {
    return reply({ success: null, message: "Irrelevant order!" }, 200);
  }

  if (!["shipment_shipped", "shipment_delivered"].includes(event)) {
    return reply({ success: false, message: "Invalid shipment event!" }, 200);
  }

  const salesOrder = await fetchExactAPI(
    "GET",
    `/salesorder/SalesOrders?$filter=OrderNumber eq ${orderNumber}&$select=OrderID,SalesOrderLines`,
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
    `/sales/ShippingMethods?$filter=Code eq '${courier_code}'&$select=ID`,
  );

  const shippingMethodID =
    shippingMethod.feed.entry.content["m:properties"]["d:ID"];

  try {
    if (event === "shipment_shipped") {
      await sendInvoice(
        orderID,
        orderNumber,
        tracking_url,
        shippingMethodID,
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
      ).catch((error) => {
        error.creation = "goods delivery";

        throw error;
      });

      return reply({ success: true, message: "Delivery status updated" }, 200);
    }
  } catch (error) {
    error.platform = "Exact";

    await sendErrorEmail(error, { orderNumber });
  }
}
