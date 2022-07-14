const headers = new Headers({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Max-Age': '-1',
})

const handleRequest = async (request) => {
  return submitHandler(request)
}

const reply = (message, status) => {
  return new Response(message, { status, headers })
}

const submitHandler = async (request) => {
  const body = await request.json()

  const reqBody = {
    'First Name': body.first_name,
    'Last Name': body.last_name,
    Email: body.email,
    'Favorite Tea': body.favorite_tea,
    Country: body.country,
    City: body.city,
    Street: body.street,
    'Postal Code': body.postal_code,
    Perk: body.perk,
  }

  const createRow = await createBaserowRecord(reqBody)

  return reply(JSON.stringify({created: true}), 200)
  // return new Response(JSON.stringify(createRow), { status: 200, headers })
}

const createBaserowRecord = (body) => {
  return fetch(
    `https://api.baserow.io/api/database/rows/table/67746/?user_field_names=true`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  ).then((res) => res.json())
}

const handleOptions = (request) => {
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

addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname == '/stripe' && request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(request, headers))
  }
  if (url.pathname == '/stripe' && request.method === 'POST') {
    return event.respondWith(handleRequest(request, headers))
  }
  return event.respondWith(
    new Response(`Method or Path Not Allowed`, { headers, status: 405 }),
  )
})
