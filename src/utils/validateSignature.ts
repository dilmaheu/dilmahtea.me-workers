export default async function validateSignature(
  payload: any,
  hashFunction: string,
  incomingSignature: string,
  webhookSecret: string,
) {
  const encoder = new TextEncoder(),
    key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: hashFunction },
      false,
      ["sign"],
    );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (signature !== incomingSignature) {
    throw new Error("Invalid signature!");
  }
}
