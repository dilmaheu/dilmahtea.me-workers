import type {
  ENV,
  Shipment,
  AcceptedShipmentEvents,
  WebhookResponseData,
} from "./types";

import updateStock from "./utils/updateStock";
import handleShipmentWebhook from "./utils/handleShipmentWebhook";

import validateSignature from "../../../utils/validateSignature";
import createModuleWorker from "../../../utils/createModuleWorker";

import { setupContext } from "./context";

export interface ProductsStockInfo {
  SKU: string;
  stockAmount: number;
}

async function handlePOST(request: Request, env: ENV): Promise<Response> {
  const payload = await request.text();

  await validateSignature(
    payload,
    "SHA-1",
    request.headers.get("X-SP-Signature"),
    env.DIMASS_WEBHOOK_SECRET,
  );

  const webhookData = JSON.parse(payload) as WebhookResponseData;

  await setupContext(request, webhookData.id);

  const event = request.headers.get("X-SP-Event") as AcceptedShipmentEvents;

  // type guard for Shipment
  const isShipment = (data: WebhookResponseData): data is Shipment =>
    event.startsWith("shipment_");

  return await (isShipment(webhookData)
    ? handleShipmentWebhook(event, webhookData)
    : updateStock());
}

handlePOST.retry = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
