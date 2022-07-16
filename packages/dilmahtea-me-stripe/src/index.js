import Stripe from 'stripe'

const stripe = new Stripe(STRIPE_SECRET_KEY_CODE, {
  // Cloudflare Workers use the Fetch API for their API requests.
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2020-08-27',
})

const headers = new Headers({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Max-Age': '-1',
})

const reply = (message, status) => {
  return new Response(message, { status, headers })
}

/**
 * POST /api/checkout
 */
const create = async request => {
  // Accomodates preview deployments AND custom domains
  // @example "https://<hash>.<branch>.<project>.pages.dev"
  const body = await request.formData()

  const {
    first_name,
    last_name,
    email,
    favorite_tea,
    country,
    city,
    street,
    postal_code,
    perk,
    locale,
    price,
    origin_url,
    plan_name,
  } = Object.fromEntries(body)

  const formObject = JSON.stringify({
    first_name,
    last_name,
    email,
    favorite_tea,
    country,
    city,
    street,
    postal_code,
    perk,
    locale,
    price,
    origin_url,
    plan_name,
  })

  try {
    // Create new Checkout Session for the order.
    // Redirects the customer to s Stripe checkout page.
    // @see https://stripe.com/docs/payments/accept-a-payment?integration=checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      mode: 'payment',
      customer_email: email,
      locale: locale,
      line_items: [
        {
          quantity: 1,
          // Reference existing item:
          //   price: PRICE_ID
          // Or, inline price data:
          price_data: {
            currency: 'eur',
            unit_amount: price * 100,
            product_data: {
              name: `${perk} Plan`,
            },
          },
        },
      ],
      // The `{CHECKOUT_SESSION_ID}` will be injected with the Stripe Session ID
      // success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      success_url: `${request.headers.get('origin')}${
        locale == 'en' ? '' : '/' + locale
      }/crowdfunding-confirmation`,
      cancel_url: origin_url,
    })
    await CROWDFUNDING.put(email, formObject)
    return Response.redirect(session.url, 303)
  } catch (err) {
    console.log(err.message)
    return reply('Error creating session', 500)
  }
}

/**
 * GET /api/checkout?sessionid=XYZ
 */
const lookup = async request => {
  const { searchParams } = new URL(request.url)

  const ident = searchParams.get('sessionid')
  if (!ident) return reply('Missing "sessionid" parameter', 400)

  try {
    const session = await stripe.checkout.sessions.retrieve(ident)
    const output = JSON.stringify(session, null, 2)
    return new Response(output, { headers })
  } catch (err) {
    return reply('Error retrieving Session JSON data', 500)
  }
}

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

async function handleRequest(request) {
  return create(request)
}

addEventListener('fetch', event => {
  const { request } = event

  let { pathname: urlPathname } = new URL(request.url)

  if (urlPathname.endsWith('/')) {
    urlPathname = urlPathname.slice(0, -1)
  }

  if (urlPathname === '/pay' && request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(request))
  }

  if (urlPathname === '/pay' && request.method === 'POST') {
    return event.respondWith(handleRequest(request))
  }

  return event.respondWith(
    reply(JSON.stringify({ error: `Method or Path Not Allowed` }), 405),
  )
})
