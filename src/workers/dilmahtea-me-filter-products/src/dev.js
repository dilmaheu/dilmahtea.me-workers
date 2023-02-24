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

async function handlePOST(request) {
  const {
    locale,
    tea_variant,
    tea_size,
    preferredProductsFilters,
  } = await request.json();

  const productsKey = [locale, tea_variant, tea_size]
    .filter(Boolean)
    .join(" | ");

  const productsData = await PRODUCTS.get(productsKey);

  if (!productsData) {
    return reply(JSON.stringify({ error: "Bad request" }), 400);
  }

  const products = JSON.parse(productsData).map((data) => {
    if (!Array.isArray(data)) return data;

    const [baseProductTitle, variants] = data;

    if (!(baseProductTitle in preferredProductsFilters)) return variants[0][1];

    const {
      tea_variant: preferredTeaVariant,
      tea_size: preferredTeaSize,
    } = preferredProductsFilters[baseProductTitle];

    const variantKey =
      !tea_variant && !tea_size
        ? [preferredTeaVariant, preferredTeaSize].join(" | ")
        : !tea_variant
        ? preferredTeaVariant
        : preferredTeaSize;

    const [, variant] = variants.find(([key]) => key === variantKey);

    return variant;
  });

  products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return reply(JSON.stringify(products), 200);
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
