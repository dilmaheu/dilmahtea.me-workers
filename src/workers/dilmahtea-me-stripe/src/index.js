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
    payment_method_name,
    stripeToken,
    bank,
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

  const paymentID = crypto.randomUUID(),
    paymentData = { ...validatedData, request_headers };

  const queryString = searchParams.toString(),
    cancelUrl = origin_url + "?" + queryString,
    successUrl = success_url +
      (payment_type === "ecommerce" ? "&paymentID=" + paymentID : "");

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
  const paymentMethod = await stripe.paymentMethods.create({
    type: payment_method_name,
    ...(payment_method_name === "card" && {
      card: {
        token: stripeToken,
      }
    }),
    ...(payment_method_name === "ideal" && {
      ideal: {
        bank: bank,
      }
    }),
  });


  if (payment_method_name === "card") {
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });
  }

  function convertPriceToCents(price, quantity = 1) {
    return Math.round(price * quantity * 100);
  }

  const totalAmount = Object.values(cart).reduce((total, item) =>
    total + convertPriceToCents(item.price, item.quantity), 0) +
    (payment_type === 'ecommerce' ? convertPriceToCents(shipping_cost) : 0);

  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    payment_method_types,
    payment_method: paymentMethod.id,
    amount: totalAmount,
    currency: 'eur',
    metadata: { paymentID, payment_type },
    ...(payment_method_name === "card" ? { confirm: true } : { return_url: successUrl }),
  });

  const confirmPaymentIntent =
    payment_method_name === "card" &&
    (await stripe.paymentIntents.confirm(paymentIntent.id));

  const redirectUrl =
    (confirmPaymentIntent?.status === "succeeded"
      ? successUrl
      : paymentIntent.next_action?.redirect_to_url?.url) || cancelUrl;

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

  return Response.redirect(redirectUrl, 303);
};

handlePOST.catchError = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
