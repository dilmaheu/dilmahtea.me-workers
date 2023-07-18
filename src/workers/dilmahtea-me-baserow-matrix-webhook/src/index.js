// @ts-check

import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function handlePOST(request, env) {
  // Check for 'Webhook-Secret' header in the incoming request
  const incomingWebhookSecret = request.headers.get("Webhook-Secret");

  if (incomingWebhookSecret !== env.WEBHOOK_SECRET) {
    throw new Error("Invalid webhook secret");
  }

  const requestBody = await request.json();

  if (!(requestBody.items.length > 0 && requestBody.table_id)) {
    throw new Error("Missing required fields in payload");
  }

  const [order] = requestBody.items;

  if (
    order.id === undefined ||
    order.Country === undefined ||
    order.City === undefined ||
    order["Cup of Kindness"] === undefined ||
    order["Payment Status"] === undefined ||
    order["Order Status"] === undefined
  ) {
    throw new Error("Missing required fields in payload item");
  }

  // Send message only when "Payment Status" is "paid" and "Order Status" is "Confirmed"
  if (
    order["Payment Status"] !== "paid" ||
    order["Order Status"] !== "Confirmed"
  ) {
    return reply("Condition not met", 200);
  }

  let messagePrefix,
    messagePostfix = "";

  if (requestBody.table_id === 159736) {
    messagePrefix = "Dev: ";
  } else if (requestBody.table_id === 108632) {
    messagePrefix = "Production: ";
    messagePostfix = " 🎉";
  } else {
    throw new Error("Invalid table_id");
  }

  const constructedMessage = {
    msgtype: "m.text",
    body: `${messagePrefix}New order - ID: ${order.id}, City: ${order.City}, Country: ${order.Country}. Purpose: ${order["Cup of Kindness"]}${messagePostfix}`,
  };

  const matrixRequestUrl = `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(
    env.MATRIX_ROOM_ID
  )}/send/m.room.message?access_token=${env.MATRIX_BOT_ACCESS_TOKEN}`;

  const matrixResponse = await fetch(matrixRequestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(constructedMessage),
  });

  if (!matrixResponse.ok) {
    throw new Error(
      `Matrix API responded with status ${matrixResponse.status}`
    );
  }

  return reply("Message sent", 200);
}

handlePOST.catchError = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
