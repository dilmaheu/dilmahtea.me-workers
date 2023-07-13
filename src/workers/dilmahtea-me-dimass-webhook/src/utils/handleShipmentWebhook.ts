import { ENV, Shipment } from "../types";

import { reply } from "../../../../utils/createModuleWorker";
import sendInvoice from "./sendInvoice";
import fetchExactAPIConstructor from "../../../../utils/fetchExactAPIConstructor";

export default async function handleShipmentWebhook(
  env: ENV,
  shipment: Shipment
) {
  const fetchExactAPI = fetchExactAPIConstructor(env);

  const orderNumber = +shipment.order.order_number;

  if (Number.isNaN(orderNumber) || orderNumber < 20000) {
    return reply({ success: null, message: "Irrelevant order" }, 200);
  }

  const salesOrder = await fetchExactAPI(
    "GET",
    `/salesorder/SalesOrders?$filter=OrderNumber eq ${orderNumber}&$select=OrderID`
  );

  const orderID = salesOrder.feed.entry.content["m:properties"]["d:OrderID"];

  if (shipment.state === 15 && shipment.sub_state === null) {
    await sendInvoice(orderID, orderNumber, fetchExactAPI, env);

    return reply({ success: true, message: "Sales invoice sent" }, 200);
  } else if (shipment.state === 15 && shipment.sub_state === 1530) {
    // update delivery status
  } else {
    return reply({ success: false, message: "Invalid shipment state" }, 400);
  }
}
