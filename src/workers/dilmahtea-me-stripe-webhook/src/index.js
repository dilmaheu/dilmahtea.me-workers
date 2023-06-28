// @ts-check

import Stripe from "stripe";
import sendEmail from "./utils/sendEmail";
import createOrder from "./utils/createOrder";
import createBaserowRecord from "./utils/createBaserowRecord";
import updateBaserowRecord from "./utils/updateBaserowRecord";
import createPurchaseEvent from "./utils/createPurchaseEvent";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

const webCrypto = Stripe.createSubtleCryptoProvider();

async function handlePOST(request, env) {
  const body = await request.text(),
    signature = request.headers.get("stripe-signature");

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // Cloudflare Workers use the Fetch API for their API requests.
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: "2022-11-15",
  });

  // Use Stripe to ensure that this is an authentic webhook request event from Stripe
  const event = await stripe.webhooks.constructEventAsync(
    body,
    signature,
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

  // @ts-ignore
  const { paymentID, payment_type } = event.data.object.metadata;

  const PAYMENT_INTENTS =
    payment_type === "crowdfunding"
      ? env.CROWDFUNDINGS
      : env.ECOMMERCE_PAYMENTS;

  const paymentIntentData = JSON.parse(await PAYMENT_INTENTS.get(paymentID)),
    { origin_url } = paymentIntentData;

  let payment_status,
    { paymentBaserowRecordID } = paymentIntentData;

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

  if (paymentBaserowRecordID) {
    if (paymentIntentData.payment_status !== payment_status) {
      promises.push(
        updateBaserowRecord(
          paymentBaserowRecordID,
          { "Payment Status": payment_status },
          payment_type,
          env
        )
      );
    }
  } else {
    const createdBaserowRecord = await createBaserowRecord(
      {
        ...paymentIntentData,
        paymentID,
        payment_status,
      },
      env
    );

    paymentBaserowRecordID = createdBaserowRecord.id;

    promises.push(
      PAYMENT_INTENTS.put(
        paymentID,
        JSON.stringify({
          ...paymentIntentData,
          paymentBaserowRecordID,
          payment_status,
        })
      )
    );
  }

  // send thank you email if payment is successful
  if (paymentIntentData && payment_status === "paid") {
    promises.push(sendEmail(paymentIntentData, env));

    const { hostname: domain } = new URL(origin_url);

    if (payment_type === "ecommerce") {
      promises.push(
        createOrder(
          { paymentID, domain, paymentBaserowRecordID, ...paymentIntentData },
          env
        )
      );

      if (domain === "dilmahtea.me") {
        createPurchaseEvent({
          promises,
          origin_url,
          paymentIntentData,
        });
      }
    }
  }

  await Promise.all(promises);

  return reply(JSON.stringify({ received: true }), 200);
}

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
