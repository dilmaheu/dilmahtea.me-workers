/**
 * Respond with hello worker text
 * @param {Request} request
 */

import { updateMailsStore } from "./utils/updateMailsStore.js";
import { updateProductsStore } from "./utils/updateProductsStore.js";

const headers = new Headers({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Max-Age": "-1",
});

const reply = (message, status) => {
  return new Response(message, { status, headers });
};

async function handlePOST(request) {
  const { event, model } = await request.json();

  if (
    [
      "entry.update",
      "entry.delete",
      "entry.publish",
      "entry.unpublish",
    ].includes(event)
  ) {
    if (
      ["entry.update", "entry.publish"].includes(event) &&
      [
        "ecommerce-payment-confirmation-mail",
        "crowdfunding-email",
        "recurring-element",
      ].includes(model)
    ) {
      return await updateMailsStore(model, reply);
    }

    if (["product", "product-size", "product-variant"].includes(model)) {
      return await updateProductsStore(model, reply);
    }

    return reply(JSON.stringify({ message: "No op" }), 200);
  }

  return reply(JSON.stringify({ error: "Bad Request" }), 400);
}

function handleOPTIONS(request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers,
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: "POST, OPTIONS",
      },
    });
  }
}

addEventListener("fetch", (event) => {
  const { request } = event;

  let { pathname } = new URL(request.url);

  if (pathname === "/") {
    switch (request.method) {
      case "POST":
        return event.respondWith(handlePOST(request));
      case "OPTIONS":
        return event.respondWith(handleOPTIONS(request));
    }
  }

  return event.respondWith(
    reply(JSON.stringify({ error: `Method or Path Not Allowed` }), 405)
  );
});
