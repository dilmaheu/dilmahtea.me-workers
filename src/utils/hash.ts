export default async function hash(
  payload: string,
  hashFunction: string,
  signingSecret?: string,
): Promise<string> {
  const textEncoder = new TextEncoder();

  let hashBuffer;

  if (signingSecret) {
    const key = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(signingSecret),
      { name: "HMAC", hash: hashFunction },
      false,
      ["sign"],
    );

    hashBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      textEncoder.encode(payload),
    );
  } else {
    hashBuffer = await crypto.subtle.digest(
      hashFunction,
      textEncoder.encode(payload),
    );
  }

  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hash;
}
