import hash from "./hash";

export default async function validateSignature(
  payload: string,
  hashFunction: string,
  incomingSignature: string,
  webhookSecret: string,
) {
  const signature = await hash(payload, hashFunction, webhookSecret);

  if (signature !== incomingSignature) {
    throw new Error("Invalid signature!");
  }
}
