/**
 * Respond with hello worker text
 * @param {Request} request
 */

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

async function handleGET(request) {
  const productsKey =
    new URL(request.url).searchParams.get("productsKey") || null;

  const products = await PRODUCTS.get(productsKey);

  if (!products) {
    return reply(JSON.stringify({ error: "Bad request" }), 400);
  }

  return reply(products, 200);
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

  let { pathname: urlPathname } = new URL(request.url);

  if (urlPathname === "/") {
    switch (request.method) {
      case "GET":
        return event.respondWith(handleGET(request));
      case "OPTIONS":
        return event.respondWith(handleOPTIONS(request));
    }
  }

  return event.respondWith(
    reply(JSON.stringify({ error: `Method or Path Not Allowed` }), 405)
  );
});
