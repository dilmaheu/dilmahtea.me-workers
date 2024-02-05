import Stripe from "stripe";

import getCustomerID from "./utils/getCustomerID";
import getValidatedData from "./utils/getValidatedData";
import createBaserowRecord from "./utils/createBaserowRecord";
import getPaymentMethodTypes from "./utils/getPaymentMethodTypes";

import getValidationDataset from "../../../utils/getValidationDataset";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

const handlePOST = async (request, env, ctx) => {
  const body = await request.formData(),
    rawPaymentData = Object.fromEntries(body);

  const CMSData = await getValidationDataset(rawPaymentData.origin_url, env),
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
    billing_first_name,
    billing_last_name,
    billing_email,
    billing_street,
    billing_city,
    billing_postal_code,
    billing_country,
    kindness_cause,
    shipping_method,
    shipping_cost,
    perk,
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
    paymentData = { ...validatedData, request_headers };

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // Cloudflare Workers use the Fetch API for their API requests.
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: "2022-11-15",
  });

  const customer = await getCustomerID(stripe, paymentData, CMSData),
    payment_method_types = await getPaymentMethodTypes(country, CMSData);

  // Create new Checkout Session for the order.
  // Redirects the customer to s Stripe checkout page.
  // @see https://stripe.com/docs/payments/accept-a-payment?integration=checkout
  const session = await stripe.checkout.sessions.create({
    locale: locale,
    mode: "payment",
    customer: customer.id,
    payment_method_types,
    cancel_url,
    success_url:
      success_url +
      (payment_type === "ecommerce" ? "&paymentID=" + paymentID : ""),
    payment_intent_data: { metadata: { paymentID, payment_type } },
    line_items: (payment_type === "ecommerce"
      ? [
          ...Object.values(cart),
          {
            name: shipping_method,
            price: shipping_cost,
            quantity: 1,
          },
        ]
      : [
          {
            name: product_desc,
            price,
            quantity: 1,
          },
        ]
    ).map(({ name, names, price, quantity }) => ({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(price * 100),
        product_data: {
          name: name || `${quantity}x ${JSON.parse(names)[locale]}`,
        },
      },
    })),
  });

  ctx.waitUntil(
    createBaserowRecord(
      {
        ...paymentData,
        paymentID,
      },
      env,
    ).then((createdBaserowRecord) => {
      const paymentBaserowRecordID = createdBaserowRecord.id;

      const PAYMENT_INTENTS =
        payment_type === "crowdfunding"
          ? env.CROWDFUNDINGS
          : env.ECOMMERCE_PAYMENTS;

      return PAYMENT_INTENTS.put(
        paymentID,
        JSON.stringify({
          ...paymentData,
          paymentBaserowRecordID,
        }),
      );
    }),
  );

  return Response.redirect(session.url, 303);
};

handlePOST.catchError = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
