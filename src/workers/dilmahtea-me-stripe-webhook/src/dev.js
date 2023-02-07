import Stripe from 'stripe'
import sendEmail from './utils/sendEmail'
import createBaserowRecord from './utils/createBaserowRecord'

const stripe = new Stripe(STRIPE_DEVELOPMENT_SECRET_KEY, {
  // Cloudflare Workers use the Fetch API for their API requests.
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2020-08-27',
})

const headers = new Headers({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
  'Access-Control-Max-Age': '-1',
})

const reply = (message, status) => new Response(message, { status, headers })

const checkWebHookRequest = async request => {
  const contentType = request.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) return false

  return true
}

async function handlePOST(request) {
  const isJson = checkWebHookRequest(request)

  if (!isJson) {
    return reply(
      JSON.stringify({ error: 'Bad request ensure json format' }),
      400,
    )
  }

  const sig = request.headers.get('stripe-signature')

  const body = await request.text()

  // Use Stripe to ensure that this is an authentic webhook request event from Stripe
  const event = await stripe.webhooks.constructEvent(
    body,
    sig,
    STRIPE_DEVELOPMENT_SIGNING_SECRET_KEY,
  )

  if (!event.data) {
    reply(
      JSON.stringify({ error: 'Issue with trying to get Stripe Event' }),
      400,
    )
  }

  const paymentIntent = event.data.object,
    { id: paymentIntentId } = paymentIntent,
    NAMESPACES = [ECOMMERCE_PAYMENTS, CROWDFUNDINGS]

  let paymentIntentData

  for (const NAMESPACE of NAMESPACES) {
    paymentIntentData = await NAMESPACE.get(paymentIntentId)

    if (paymentIntentData) break
  }

  const parsedPaymentIntentData = JSON.parse(paymentIntentData),
    { payment_type, origin_url } = parsedPaymentIntentData

  let payment_status

  switch (event.type) {
    case 'payment_intent.succeeded':
      payment_status = 'paid'
      break
    case 'payment_intent.payment_failed':
      payment_status = 'failed'
      break
    case 'payment_intent.canceled':
      payment_status = 'canceled'
      break
  }

  const promises = []

  // send thank you email if payment is successful
  if (payment_status === 'paid' && paymentIntentData) {
    promises.push(sendEmail(parsedPaymentIntentData))

    const { hostname: domain } = new URL(origin_url)

    if (domain === 'dilmahtea.me' && payment_type === 'ecommerce') {
      const { cart, request_headers } = parsedPaymentIntentData,
        purchasedProducts = Object.values(JSON.parse(cart)),
        purchaseEventRequestHeaders = new Headers(request_headers)

      purchaseEventRequestHeaders.set('Content-Type', 'application/json')

      purchasedProducts.forEach(product => {
        promises.push(
          fetch('https://plausible.io/api/event', {
            method: 'POST',
            headers: Object.fromEntries(purchaseEventRequestHeaders),
            body: JSON.stringify({
              name: 'Purchase',
              url: origin_url,
              domain: 'dilmahtea.me',
              props: {
                SKU: product.sku,
                Title: JSON.parse(product.names).en,
                Currency: 'EUR',
                Price: product.price,
                Quantity: product.quantity,
                Category: 'Tea',
              },
            }),
          }),
        )
      })
    }
  }

  promises.push(
    createBaserowRecord({
      ...parsedPaymentIntentData,
      payment_status,
      payment_intent_id: paymentIntentId,
    }),
  )

  await Promise.all(promises)

  return reply(JSON.stringify({ received: true }), 200)
}

const handleOPTIONS = request => {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    return reply(null, 200)
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: 'POST, OPTIONS',
      },
    })
  }
}

addEventListener('fetch', event => {
  const { request } = event

  let { pathname: urlPathname } = new URL(request.url)

  if (urlPathname === '/') {
    if (request.method === 'OPTIONS') {
      return event.respondWith(handleOPTIONS(request))
    }

    if (request.method === 'POST' && request.headers.get('stripe-signature')) {
      return event.respondWith(handlePOST(request))
    }
  }

  return event.respondWith(
    reply(JSON.stringify({ error: `Method or Path Not Allowed` }), 405),
  )
})
