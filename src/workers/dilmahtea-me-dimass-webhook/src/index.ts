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

  // disable signature validation temporarily till Dimass fixes incorrect signature issue
  // await validateSignature(
  //   webhookData,
  //   "SHA-1",
  //   request.headers.get("X-SP-Signature"),
  //   env.DIMASS_WEBHOOK_SECRET
  // );

  // temporarily perform validation by passing a secret in the request header
  if (
    request.headers.get("Dimass-Temp-Webhook-Secret") !==
    env.DIMASS_TEMP_WEBHOOK_SECRET
  ) {
    throw new Error("Invalid secret!");
  }

  // type guard for Shipment
  const isShipment = (data: WebhookResponseData): data is Shipment =>
    "shipment_lines" in data;

  return await (isShipment(webhookData)
    ? handleShipmentWebhook(webhookData)
    : updateStock());
}

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
