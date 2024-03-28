import Stripe from "stripe";

import getCustomerID from "./utils/getCustomerID";
import getValidatedData from "./utils/getValidatedData";
import createBaserowRecord from "./utils/createBaserowRecord";
import getPaymentMethodTypes from "./utils/getPaymentMethodTypes";

import D1Strapi from "../../../utils/D1Strapi";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

const handlePOST = async (request, env, ctx) => {
  const rawPaymentData = await request.json();

  const CMSData = await D1Strapi(),
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
    customer,
  } = validatedData;

  const paymentID = crypto.randomUUID(),
    paymentData = { ...validatedData, request_headers };

  const successURL =
    success_url +
    (payment_type === "ecommerce" ? "?paymentID=" + paymentID : "");

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // Cloudflare Workers use the Fetch API for their API requests.
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: "2022-11-15",
  });

  const stripeCustomer = await getCustomerID(stripe, customer),
    payment_method_types = await getPaymentMethodTypes(
      billing_country,
      CMSData,
    );

  function convertPriceToCents(price) {
    return Math.round(price * 100); // price is already multiplied by quantity
  }

  const totalAmount =
    Object.values(cart).reduce(
      (total, item) => total + convertPriceToCents(item.price),
      0,
    ) + (payment_type === "ecommerce" ? convertPriceToCents(shipping_cost) : 0);

  const paymentIntent = await stripe.paymentIntents.create({
    customer: stripeCustomer.id,
    payment_method_types,
    amount: totalAmount,
    currency: "eur",
    metadata: { paymentID, payment_type },
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

  return reply(
    {
      success: true,
      client_secret: paymentIntent.client_secret,
      successURL,
    },
    200,
  );
};

handlePOST.catchError = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
