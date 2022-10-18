/**
 * Respond with hello worker text
 * @param {Request} request
 */

const reply = (message, status) => {
  return new Response(message, { status, headers })
}

const headers = new Headers({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Max-Age': '-1',
})

const sendEmail = async body => {
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
  } = body

  const crowdfundingEmailData = JSON.parse(
    await CROWDFUNDING_EMAIL.get('Crowdfunding Email'),
  )

  const crowdfundingEmail = crowdfundingEmailData[locale]

  const { Subject, From_name, From_email, htmlEmail } = crowdfundingEmail

  const crowdfundingEmailHTML = htmlEmail
    .replaceAll('${first_name}', first_name)
    .replaceAll('${perk}', perk)
    .replaceAll('${price}', price)
    .replaceAll('${street}', street)
    .replaceAll('${postal_code}', postal_code)
    .replaceAll('${city}', city)
    .replaceAll('${country}', country)

  const name = `${first_name} ${last_name}`

  const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email, name }],
          dkim_domain: 'dilmahtea.me',
          dkim_selector: 'mailchannels',
          dkim_private_key: DKIM_PRIVATE_KEY,
        },
      ],
      from: {
        email: From_email,
        name: From_name,
      },
      subject: Subject,
      content: [
        {
          type: 'text/html',
          value: crowdfundingEmailHTML,
        },
      ],
    }),
  })

  await fetch(send_request).then(res => res.json())

  return reply(JSON.stringify({ sent: true }), 200)
}

const handlePOST = async request => {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const requestBody = await request.json()

    if (
      requestBody['first_name'] &&
      requestBody['last_name'] &&
      requestBody['email'] &&
      requestBody['first_name']
    ) {
      return sendEmail(requestBody)
    }
  }

  reply('Wrong Method', 405)
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