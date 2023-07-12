import Stripe from "stripe";
import getCMSData from "./utils/getCMSData";
import getValidatedData from "./utils/getValidatedData";
import getPaymentMethodTypes from "./utils/getPaymentMethodTypes";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

let CMSData;

const handlePOST = async (request, env) => {
  CMSData = await getCMSData(env);

  const body = await request.formData(),
    rawPaymentData = Object.fromEntries(body),
    validatedData = await getValidatedData(rawPaymentData, CMSData, env);

  if (validatedData.errors) {
    return reply(validatedData, 400);
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

  const paymentID = crypto.randomUUID(),
    paymentData = JSON.stringify({ ...validatedData, request_headers });

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // Cloudflare Workers use the Fetch API for their API requests.
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: "2022-11-15",
  });

  const payment_method_types = await getPaymentMethodTypes(country, CMSData);

  // Create new Checkout Session for the order.
  // Redirects the customer to s Stripe checkout page.
  // @see https://stripe.com/docs/payments/accept-a-payment?integration=checkout
  const session = await stripe.checkout.sessions.create({
    locale: locale,
    mode: "payment",
    customer_email: email,
    payment_method_types,
    cancel_url,
    success_url,
    payment_intent_data: { metadata: { paymentID, payment_type } },
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

  const PAYMENT_INTENTS =
    payment_type === "crowdfunding"
      ? env.CROWDFUNDINGS
      : env.ECOMMERCE_PAYMENTS;

  await PAYMENT_INTENTS.put(paymentID, paymentData);

  return Response.redirect(session.url, 303);
};

handlePOST.isPublic = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
