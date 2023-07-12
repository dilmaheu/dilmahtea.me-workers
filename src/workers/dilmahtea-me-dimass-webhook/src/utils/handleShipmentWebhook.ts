import { ENV, Shipment } from "../types";

import { reply } from "../../../../utils/createModuleWorker";
import sendInvoice from "./sendInvoice";
import fetchExactAPIConstructor from "../../../../utils/fetchExactAPIConstructor";

export default async function handleShipmentWebhook(
  env: ENV,
  webhookData: Shipment
) {
  const fetchExactAPI = fetchExactAPIConstructor(env);

  const { order_number } = webhookData.order;

  const salesOrder = await fetchExactAPI(
    "GET",
    `/salesorder/SalesOrders?$filter=OrderNumber eq ${order_number}&$select=OrderID`
  );

  const {
    "d:OrderID": orderID,
    "d:OrderNumber": orderNumber,
  } = salesOrder.entry.content["m:properties"];

  if (webhookData.sub_state === 1530) {
    // update delivery status
  } else if (webhookData.state === 15) {
    await sendInvoice(orderID, orderNumber, fetchExactAPI, env);

    return reply(
      JSON.stringify({ success: true, message: "Sales invoice sent" }, null, 2),
      200
    );
  }

  return reply(
    JSON.stringify(
      { success: false, message: "Invalid Shipment data" },
      null,
      2
    ),
    400
  );
}
