import Stripe from 'stripe'

const stripe = new Stripe(STRIPE_PRODUCTION_SECRET_KEY, {
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
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

const checkWebHookRequest = async request => {
  const contentType = request.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) return false

  return true
}

const handleOptions = request => {
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

async function handleRequest(request) {
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
    STRIPE_PRODUCTION_SIGNING_SECRET_KEY,
  )

  if (!event['data']) {
    reply(
      JSON.stringify({ error: 'Issue with trying to get Stripe Event' }),
      400,
    )
  }

  const paymentIntent = event.data.object

  const charges = paymentIntent.charges['data']

  if (!charges) {
    reply(JSON.stringify({ error: 'No Charges have been made' }), 400)
  }

  let email = charges[0].billing_details.email

  if (email) {
    const storedValue = await CROWDFUNDING.get(email)

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
      default:
        payment_status = 'unknown'
        break
    }

    const baserowRequestBody = JSON.stringify({
      ...JSON.parse(storedValue),
      payment_status,
    })

    const baserowRequest = createRequest(
      'https://scripts.dilmahtea.me/crowdfunding-form',
      baserowRequestBody,
    )

    await BASEROW.fetch(baserowRequest)

    if (event.type == 'payment_intent.succeeded' && storedValue) {
      const emailRequest = createRequest(
        'https://scripts.dilmahtea.me/crowdfunding-mail',
        storedValue,
      )

      await EMAIL.fetch(emailRequest)
    }

    await CROWDFUNDING.delete(email)
  }

  return reply(JSON.stringify({ received: true }), 200)
}

addEventListener('fetch', event => {
  const { request } = event

  let { pathname: urlPathname } = new URL(request.url)

  if (urlPathname.endsWith('/')) {
    urlPathname = urlPathname.slice(0, -1)
  }

  if (urlPathname === '/pay-webhook' && request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(request))
  }

  if (
    urlPathname === '/pay-webhook' &&
    request.method === 'POST' &&
    request.headers.get('stripe-signature')
  ) {
    return event.respondWith(handleRequest(request))
  }

  return event.respondWith(
    reply(JSON.stringify({ error: `Method or Path Not Allowed` }), 405),
  )
})
