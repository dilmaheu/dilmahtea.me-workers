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
   *
   * **note**
   *
   * The typescript server thinks `btoa` is deprecated (because of node) but cloudflare still uses & recommends it.
   */
  const expectedSignature = btoa(
    String.fromCharCode(...Array.from(new Uint8Array(signatureBuffer)))
  );

  /**Decoding the incoming signature taken from the header. */
  const incomingSignatureBytes = new Uint8Array(incomingSignature.length / 2);

  for (let i = 0; i < incomingSignatureBytes.length; i++) {
    const startIndex = i * 2;
    const endIndex = startIndex + 2;
    const hexByte = incomingSignature.slice(startIndex, endIndex);

    incomingSignatureBytes[i] = parseInt(hexByte, 16);
  }

  /**
   *
   * `btoa`: Decodes a string into bytes using Latin-1 (ISO-8859),
   * and encodes those bytes into a string using Base64.
   *
   * This was necessary because...??
   * Anyway if you don't do this it doesn't work;
   * the hashes won't match even though they should.
   */
  const incomingSignatureBase64 = btoa(
    String.fromCharCode(...incomingSignatureBytes)
  );

  /**
   * Authenticating the request.
   *
   * Checks if the signature matches the secret provided to the dimass webhook.
   *
   * ### References
   * 1. Dimass webhook - Headers: https://developer.supportplaza.nl/webhooks/introduction.html#headers
   * 2. Dimass webhook - Signature generation: https://developer.supportplaza.nl/webhooks/signature.html
   */
  if (!(expectedSignature === incomingSignatureBase64)) {
    throw new Error("Signature doesn't match.");
  }
}
