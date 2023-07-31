// @ts-check

export default async function validateSignature(webhookData, env) {
  const { Content } = webhookData;

  const encoder = new TextEncoder(),
    key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(env.EXACT_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

  const payload = JSON.stringify(Content),
    hashCodeBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

  const hashCode = Array.from(new Uint8Array(hashCodeBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (hashCode !== webhookData.HashCode.toLowerCase()) {
    throw new Error("Hash codes don't match.");
  }

  return Content;
}
