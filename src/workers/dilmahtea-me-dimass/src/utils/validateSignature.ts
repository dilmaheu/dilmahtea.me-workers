import { ENV, WebhookResponseData } from "../types";

export default async function validateSignature(
  request: Request,
  env: ENV,
  webhookData: WebhookResponseData
) {
  const incomingSignature = request.headers.get("X-SP-Signature");

  if (!incomingSignature) {
    throw new Error("No secret signature was provided.");
  }

  const encoder = new TextEncoder(),
    key = await crypto.subtle.importKey(
      "raw",
      // encode the secret
      encoder.encode(env.DIMASS_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );

  const webhookPayload = JSON.stringify(webhookData),
    signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      // encode the request payload
      encoder.encode(webhookPayload)
    );

  /**
   * Constructing the expected signature from the request payload and the symmetric key
   */
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  /**
   * Authenticating the request.
   *
   * Checks if the signature matches the secret provided to the dimass webhook.
   *
   * ### References
   * 1. Dimass webhook - Headers: https://developer.supportplaza.nl/webhooks/introduction.html#headers
   * 2. Dimass webhook - Signature generation: https://developer.supportplaza.nl/webhooks/signature.html
   */
  if (!(expectedSignature === incomingSignature)) {
    throw new Error("Signature doesn't match.");
  }
}
