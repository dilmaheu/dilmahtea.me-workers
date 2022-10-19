import Stripe from 'stripe'

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

const createRequest = (url, body) =>
  new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })

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
    NAMESPACES = [ECOMMERCE_PAYMENTS, CROWDFUNDING]

  let storedValue

  for (const NAMESPACE of NAMESPACES) {
    storedValue = await NAMESPACE.get(paymentIntentId)

    if (storedValue) break
  }

  // send thank you email if payment is successful
  if (event.type === 'payment_intent.succeeded') {
    if (event.type == 'payment_intent.succeeded' && storedValue) {
      const emailRequest = createRequest(
        'https://dev.crowdfunding-mail.dilmah.scripts.dilmahtea.me',
        storedValue,
      )

      await EMAIL.fetch(emailRequest)
    }
  }

  // add Baserow record for the event
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

  const baserowRequestBody = JSON.stringify({
    ...JSON.parse(storedValue),
    payment_status,
  })

  const baserowRequest = createRequest(
    'https://dev.crowdfunding-form.scripts.dilmahtea.me',
    baserowRequestBody,
  )

  await BASEROW.fetch(baserowRequest)

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
