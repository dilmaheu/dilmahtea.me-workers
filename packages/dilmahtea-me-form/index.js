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

const submitHandler = async (request) => {
  const FORM_URL = `${request.headers.get('origin')}/crowdfunding-confirmation`
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
  } = Object.fromEntries(body)

  const reqBody = {
    'First Name': first_name,
    'Last Name': last_name,
    Email: email,
    'Favorite Tea': favorite_tea,
    Country: country,
    City: city,
    Street: street,
    'Postal Code': postal_code,
    Perk: perk,
  }

  const createRow = await createBaserowRecord(reqBody)
  return Response.redirect(FORM_URL)
  // return new Response(JSON.stringify(createRow), { status: 200, headers })
}

const createBaserowRecord = (body) => {
  return fetch(
    `https://api.baserow.io/api/database/rows/table/67746/?user_field_names=true`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Token F1DeH7c3HW8UQGA5HPmfe4ILDJhCG0Xo`,
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

  if (url.pathname == '/' && request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(request, headers))
  }
  if (url.pathname == '/' && request.method === 'POST') {
    return event.respondWith(handleRequest(request, headers))
  }
  return event.respondWith(
    new Response(`Method or Path Not Allowed`, { headers, status: 405 }),
  )
})
