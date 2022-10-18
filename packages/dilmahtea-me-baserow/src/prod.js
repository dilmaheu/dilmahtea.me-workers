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
    payment_status,
  } = await request.json()

  const createRecordRequestBody = {
    'First Name': first_name,
    'Last Name': last_name,
    Email: email,
    'Favorite Tea': favorite_tea,
    Country: country,
    City: city,
    Street: street,
    'Postal Code': postal_code,
    Perk: perk,
    'Amount Paid': price,
    Locale: locale,
    'Payment Status': payment_status,
  }

  const recordCreatedResponse = await fetch(
    `https://api.baserow.io/api/database/rows/table/67746/?user_field_names=true`,
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
