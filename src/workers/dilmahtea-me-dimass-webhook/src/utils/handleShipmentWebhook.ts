import type { Shipment, AcceptedShipmentEvents } from "../types";

import env from "../env";
import context from "../context";

import { reply } from "../../../../utils/createModuleWorker";

import sendInvoice from "./sendInvoice";
import createGoodsDelivery from "./createGoodsDelivery";

import fetchExactAPI from "../../../../utils/fetchExactAPI";
import throwExtendedError from "../../../../utils/throwExtendedError";

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

  if (event === "shipment_delivered" && !context.DeliveryDate) {
    const AmsterdamTime = (await fetch(
      "https://timeapi.io/api/TimeZone/zone?timeZone=Europe/Amsterdam",
    ).then(async (res) => res.json())) as Record<string, any>;

    context.DeliveryDate = AmsterdamTime.currentLocalTime;
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

  if (event === "shipment_shipped") {
    await sendInvoice(
      orderID,
      orderNumber,
      tracking_url,
      shippingMethodID,
    ).catch(async (error) => {
      await throwExtendedError({
        error,
        requestData: { OrderNumber: orderNumber },
        subject: "Exact: Error sending invoice",
        bodyText:
          "An error was thrown while sending invoice. Please manually send the invoice.",
      });
    });

    return reply({ success: true, message: "Sales invoice sent" }, 200);
  } else {
    await createGoodsDelivery(
      orderID,
      orderNumber,
      TrackingNumber,
      shippingMethodID,
    ).catch(async (error) => {
      await throwExtendedError({
        error,
        requestData: { OrderNumber: orderNumber },
        subject: "Exact: Error creating goods delivery",
        bodyText:
          "An error was thrown while creating goods delivery. Please manually create the goods delivery.",
      });
    });

    return reply({ success: true, message: "Delivery status updated" }, 200);
  }
}
