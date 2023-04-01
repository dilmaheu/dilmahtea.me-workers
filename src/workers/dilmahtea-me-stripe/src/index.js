import Stripe from "stripe";
import { getValidatedData } from "./utils/getValidatedData";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

const handlePOST = async (request, env) => {
  const body = await request.formData(),
    data = Object.fromEntries(body),
    validatedData = await getValidatedData(data, env);

  if (validatedData.errors) {
    return reply(JSON.stringify(validatedData), 400);
  }

  const request_headers = Object.fromEntries(request.headers);

  const {
    first_name,
    last_name,
    email,
    favorite_tea,
    country,
    city,
    street,
    postal_code,
    kindness_cause,
    shipping_method,
    shipping_cost,
    perk,
    product_name,
    product_desc,
    cart,
    price,
    tax,
    payment_type,
    locale,
    origin_url,
    success_url,
  } = validatedData;

  const paymentData = JSON.stringify({ ...validatedData, request_headers });

  const searchParams = new URLSearchParams({
    first_name,
    last_name,
    email,
    favorite_tea,
    country,
    city,
    street,
    postal_code,
  });

  const queryString = searchParams.toString(),
    cancel_url = origin_url + "?" + queryString;

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // Cloudflare Workers use the Fetch API for their API requests.
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: "2022-11-15",
  });

  // Create new Checkout Session for the order.
  // Redirects the customer to s Stripe checkout page.
  // @see https://stripe.com/docs/payments/accept-a-payment?integration=checkout
  const session = await stripe.checkout.sessions.create({
    locale: locale,
    mode: "payment",
    customer_email: email,
    payment_method_types: ["card", "ideal"],
    cancel_url,
    success_url,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(price * 100),
          product_data: {
            name: product_name,
            description: product_desc,
          },
        },
      },
    ],
  });

  const paymentIntentID = session.payment_intent;

  const PAYMENT_INTENTS =
    payment_type === "crowdfunding"
      ? env.CROWDFUNDINGS
      : env.ECOMMERCE_PAYMENTS;

  await PAYMENT_INTENTS.put(paymentIntentID, paymentData);

  return Response.redirect(session.url, 303);
};

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
