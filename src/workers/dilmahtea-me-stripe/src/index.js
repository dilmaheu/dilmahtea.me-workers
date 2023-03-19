import Stripe from "stripe";
import { getValidatedData } from "./utils/getValidatedData";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

const handlePOST = async (request, env, ctx) => {
  const body = await request.formData(),
    data = Object.fromEntries(body);

  const validatedData = await getValidatedData(data, env);

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

  const searchParams = new URLSearchParams();

  searchParams.set("first_name", first_name);
  searchParams.set("last_name", last_name);
  searchParams.set("email", email);
  searchParams.set("favorite_tea", favorite_tea);
  searchParams.set("country", country);
  searchParams.set("city", city);
  searchParams.set("street", street);
  searchParams.set("postal_code", postal_code);

  const queryString = searchParams.toString(),
    cancel_url = origin_url + "?" + queryString;

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      // Cloudflare Workers use the Fetch API for their API requests.
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: "2020-08-27",
    });

    // Create new Checkout Session for the order.
    // Redirects the customer to s Stripe checkout page.
    // @see https://stripe.com/docs/payments/accept-a-payment?integration=checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      mode: "payment",
      customer_email: email,
      locale: locale,
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
      success_url,
      cancel_url,
    });

    const paymentIntentID = session.payment_intent;

    switch (payment_type) {
      case "crowdfunding":
        await env.CROWDFUNDINGS.put(paymentIntentID, paymentData);
        break;

      case "ecommerce":
        await env.ECOMMERCE_PAYMENTS.put(paymentIntentID, paymentData);
        break;
    }

    return Response.redirect(session.url, 303);
  } catch (err) {
    return reply(JSON.stringify(err), 500);
  }
};

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
