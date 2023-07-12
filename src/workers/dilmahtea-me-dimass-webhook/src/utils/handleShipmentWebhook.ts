import { ENV, Shipment } from "../types";

import { reply } from "../../../../utils/createModuleWorker";
import sendInvoice from "./sendInvoice";
import fetchExactAPIConstructor from "../../../../utils/fetchExactAPIConstructor";

export default async function handleShipmentWebhook(
  env: ENV,
  webhookData: Shipment
) {
  const fetchExactAPI = fetchExactAPIConstructor(env);

  const orderNumber = +webhookData.order.order_number;

  if (Number.isNaN(orderNumber) || orderNumber < 20000) {
    return reply(
      JSON.stringify({ success: null, message: "Irrelevant order" }, null, 2),
      200
    );
  }

  const salesOrder = await fetchExactAPI(
    "GET",
    `/salesorder/SalesOrders?$filter=OrderNumber eq ${orderNumber}&$select=OrderID`
  );

  const { "d:OrderID": orderID } = salesOrder.entry.content["m:properties"];

  if (webhookData.state === 15 && webhookData.sub_state === null) {
    await sendInvoice(orderID, orderNumber, fetchExactAPI, env);

    return reply(
      JSON.stringify({ success: true, message: "Sales invoice sent" }, null, 2),
      200
    );
  } else if (webhookData.state === 15 && webhookData.sub_state === 1530) {
    // update delivery status
  } else {
    return reply(
      JSON.stringify(
        {
          success: false,
          message: "Invalid shipment state",
        },
        null,
        2
      ),
      400
    );
  }
}
