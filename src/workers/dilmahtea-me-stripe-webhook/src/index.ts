import { ENV } from "./types";

import Stripe from "stripe";
import sendEmail from "./utils/sendEmail";
import createOrder from "./utils/createOrder";
import updateBaserowRecord from "./utils/updateBaserowRecord";
import createPurchaseEvent from "./utils/createPurchaseEvent";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

import context, { setupContext } from "./context";

type MetaData = {
  paymentID: string;
  payment_type: "crowdfunding" | "ecommerce";
};

const webCrypto = Stripe.createSubtleCryptoProvider();

async function handlePOST(request: Request, env: ENV) {
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
    webCrypto,
  );

  if (!event.data) {
    return reply({ error: "Issue with trying to get Stripe Event" }, 400);
  }

  // @ts-ignore
  const { paymentID, payment_type } = event.data.object.metadata as MetaData;

  await setupContext(request, paymentID);

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

  const promises: Promise<any>[] = [];

  if (paymentIntentData.payment_status !== payment_status) {
    promises.push(
      updateBaserowRecord(
        paymentBaserowRecordID,
        { "Payment Status": payment_status },
        payment_type,
      ).then(() =>
        PAYMENT_INTENTS.put(
          paymentID,
          JSON.stringify({ ...paymentIntentData, payment_status }),
        ),
      ),
    );
  }

  // send thank you email if payment is successful
  if (paymentIntentData && payment_status === "paid") {
    payment_type === "crowdfunding" &&
      promises.push(sendEmail(paymentIntentData));

    const { hostname: domain } = new URL(origin_url);

    if (payment_type === "ecommerce") {
      if (!context.hasCreatedOrder) {
        promises.push(
          createOrder({
            paymentID,
            domain,
            paymentBaserowRecordID,
            ...paymentIntentData,
          }).then(() => {
            context.hasCreatedOrder = true;
          }),
        );
      }

      if (env.ENVIRONMENT === "PRODUCTION") {
        if (!context.hasCreatedPurchaseEvent) {
          promises.push(
            createPurchaseEvent({
              origin_url,
              paymentIntentData,
            }).then(() => {
              context.hasCreatedPurchaseEvent = true;
            }),
          );
        }
      }
    }
  }

  await Promise.all(promises);

  return reply({ received: true }, 200);
}

handlePOST.retry = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
