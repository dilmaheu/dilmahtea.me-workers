import Stripe from 'stripe'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
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

const processWebHook = async request => {
  const sig = request.headers.get('stripe-signature')
  const requestBody = await request.text()

  let event
  let paymentIntent

  try {
    // Use Stripe to ensure that this is an authentic webhook request event from Stripe
    event = stripe.webhooks.constructEvent(
      requestBody,
      sig,
      STRIPE_SIGNING_SECRET,
    )
    paymentIntent = event.data.object
  } catch (err) {
    return reply(`Webhook Error: ${err.message}`, 400)
  }

  // Handle the event
  if (event.type == 'payment_intent.succeeded') {
    const email = paymentIntent.charges.data[0].billing_details.email
    if (email) {
      const storedValue = await CROWDFUNDING.get(email)
      if (storedValue) {
        // Create Baserow Record
        const parsedValue = JSON.parse(storedValue)
        try {
          await fetch('https://dilmahtea-me-form.dilmah.workers.dev', {
            method: 'POST',
            headers,
            body: storedValue,
          })
          await fetch('https://dilmahtea-me-email.dilmah.workers.dev', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              first_name: parsedValue.first_name,
              last_name: parsedValue.last_name,
              email: parsedValue.email,
            }),
          })
          await CROWDFUNDING.delete(email)
        } catch (err) {
          reply(err.message, 400)
        }
      }
    }
  } else if (
    event.type == 'payment_intent.payment_failed' ||
    event.type == 'payment_intent.canceled'
  ) {
    const email = paymentIntent.charges.data[0].billing_details.email
    if (email) await CROWDFUNDING.delete(email)
  }

  // Return a 200 response to acknowledge receipt of the event
  return reply(JSON.stringify({ received: true }), 200)
}

const readWebHookRequest = async request => {
  const contentType = request.headers.get('content-type') || ''
  const stripeSignature = request.headers.get('stripe-signature') || ''

  if (contentType.includes('application/json') && stripeSignature) {
    return processWebHook(request)
  }
  return reply('Bad Request', 400)
}
const handleWebHook = async request => readWebHookRequest(request)

const handleOptions = request => {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers,
    })
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
  const url = new URL(request.url)

  if (url.pathname == '/' && request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(request))
  }
  if (
    url.pathname == '/' &&
    request.method === 'POST' &&
    request.headers.get('stripe-signature')
  ) {
    return event.respondWith(handleWebHook(request))
  }

  return event.respondWith(
    new Response(`Method or Path Not Allowed`, { headers, status: 405 }),
  )
})
