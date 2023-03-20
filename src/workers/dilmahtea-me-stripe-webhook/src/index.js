import Stripe from "stripe";
import sendEmail from "./utils/sendEmail";
import createBaserowRecord from "./utils/createBaserowRecord";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

const webCrypto = Stripe.createSubtleCryptoProvider();

async function handlePOST(request, env) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply(
      JSON.stringify({ error: "Bad request ensure json format" }),
      400
    );
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // Cloudflare Workers use the Fetch API for their API requests.
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: "2020-08-27",
  });

  const sig = request.headers.get("stripe-signature");

  const body = await request.text();

  // Use Stripe to ensure that this is an authentic webhook request event from Stripe
  const event = await stripe.webhooks.constructEventAsync(
    body,
    sig,
    env.STRIPE_SIGNING_SECRET_KEY,
    undefined,
    webCrypto
  );

  if (!event.data) {
    reply(
      JSON.stringify({ error: "Issue with trying to get Stripe Event" }),
      400
    );
  }

  const paymentIntent = event.data.object,
    { id: paymentIntentId } = paymentIntent,
    NAMESPACES = [env.ECOMMERCE_PAYMENTS, env.CROWDFUNDINGS];

  let paymentIntentData;

  for (const NAMESPACE of NAMESPACES) {
    paymentIntentData = await NAMESPACE.get(paymentIntentId);

    if (paymentIntentData) break;
  }

  const parsedPaymentIntentData = JSON.parse(paymentIntentData),
    { payment_type, origin_url } = parsedPaymentIntentData;

  let payment_status;

  switch (event.type) {
    case "payment_intent.succeeded":
      payment_status = "paid";
      break;
    case "payment_intent.payment_failed":
      payment_status = "failed";
      break;
    case "payment_intent.canceled":
      payment_status = "canceled";
      break;
  }

  const promises = [];

  // send thank you email if payment is successful
  if (payment_status === "paid" && paymentIntentData) {
    promises.push(sendEmail(parsedPaymentIntentData, env));

    const { hostname: domain } = new URL(origin_url);

    if (domain === "dilmahtea.me" && payment_type === "ecommerce") {
      const { cart, request_headers } = parsedPaymentIntentData,
        purchasedProducts = Object.values(JSON.parse(cart)),
        purchaseEventRequestHeaders = new Headers(request_headers);

      purchaseEventRequestHeaders.set("Content-Type", "application/json");

      purchasedProducts.forEach((product) => {
        promises.push(
          fetch("https://plausible.io/api/event", {
            method: "POST",
            headers: Object.fromEntries(purchaseEventRequestHeaders),
            body: JSON.stringify({
              name: "Purchase",
              url: origin_url,
              domain: "dilmahtea.me",
              props: {
                SKU: product.sku,
                Title: JSON.parse(product.names).en,
                Currency: "EUR",
                Price: product.price,
                Quantity: product.quantity,
                Category: "Tea",
              },
            }),
          })
        );
      });
    }
  }

  promises.push(
    createBaserowRecord(
      {
        ...parsedPaymentIntentData,
        payment_status,
        payment_intent_id: paymentIntentId,
      },
      env
    )
  );

  await Promise.all(promises);

  return reply(JSON.stringify({ received: true }), 200);
}

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
