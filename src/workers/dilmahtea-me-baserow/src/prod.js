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

const handlePOST = async request => {
  const data = await request.json()

  const { getValidatedData } = await import(
    '../../../utils/getValidatedData.js'
  )

  const validatedData = getValidatedData(data)

  if (validatedData.errors) {
    return reply(JSON.stringify(validatedData), 400)
  }

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
    payment_status,
    payment_intent_id,
  } = validatedData

  const databaseTableID =
    payment_type === 'crowdfunding'
      ? 67746
      : payment_type === 'ecommerce'
      ? 108632
      : null

  const createRecordRequestBody = {
    'First Name': first_name,
    'Last Name': last_name,
    Email: email,
    'Favorite Tea': favorite_tea,
    Country: country,
    City: city,
    Street: street,
    'Postal Code': postal_code,
    'Payment Intent ID': payment_intent_id,
    'Order Description': product_desc,
    'Cup of Kindness': kindness_cause,
    'Shipping Method': shipping_method,
    'Shipping Cost': shipping_cost,
    Perk: perk,
    'Amount Paid': price,
    'Total Tax': tax,
    Locale: locale,
    'Payment Status': payment_status,
  }

  const recordCreatedResponse = await fetch(
    `https://api.baserow.io/api/database/rows/table/${databaseTableID}/?user_field_names=true`,
    {
      method: 'POST',
      body: JSON.stringify(createRecordRequestBody),
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  ).then(res => res.json())

  return new Response(
    JSON.stringify({ recordCreated: true, response: recordCreatedResponse }),
    { status: 200, headers },
  )
}

const handleOPTIONS = request => {
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

  let { pathname: urlPathname } = new URL(request.url)

  if (urlPathname === '/') {
    switch (request.method) {
      case 'POST':
        return event.respondWith(handlePOST(request))
      case 'OPTIONS':
        return event.respondWith(handleOPTIONS(request))
    }
  }

  return event.respondWith(
    new Response(JSON.stringify({ error: `Method or Path Not Allowed` }), {
      headers,
      status: 405,
    }),
  )
})
