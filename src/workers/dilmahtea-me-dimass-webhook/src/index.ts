import { ENV, Shipment, WebhookResponseData } from "./types";

import updateStock from "./utils/updateStock";
import validateSignature from "./utils/validateSignature";
import createModuleWorker from "../../../utils/createModuleWorker";
import handleShipmentWebhook from "./utils/handleShipmentWebhook";

export interface ProductsStockInfo {
  SKU: string;
  stockAmount: number;
}

async function handlePOST(request: Request, env: ENV): Promise<Response> {
  const webhookData = await request.json<WebhookResponseData>();

  validateSignature(request, env, webhookData);

  // type guard for Shipment
  const isShipment = (data: WebhookResponseData): data is Shipment =>
    "shipment_lines" in data;

  return await (isShipment(webhookData)
    ? handleShipmentWebhook(env, webhookData)
    : updateStock(env));
}

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
