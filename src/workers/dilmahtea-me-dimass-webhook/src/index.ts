import { ENV, Shipment, WebhookResponseData } from "./types";

import updateStock from "./utils/updateStock";
import handleShipmentWebhook from "./utils/handleShipmentWebhook";

import validateSignature from "../../../utils/validateSignature";
import createModuleWorker from "../../../utils/createModuleWorker";

export interface ProductsStockInfo {
  SKU: string;
  stockAmount: number;
}

async function handlePOST(request: Request, env: ENV): Promise<Response> {
  const webhookData = await request.json<WebhookResponseData>();

  await validateSignature(
    webhookData,
    "SHA-1",
    request.headers.get("X-SP-Signature"),
    env.DIMASS_WEBHOOK_SECRET
  );

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
