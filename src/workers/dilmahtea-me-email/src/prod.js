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

const sendEmail = async data => {
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
    tax = 0,
    payment_type,
    locale,
    origin_url,
    success_url,
  } = data

  const mailKey =
    payment_type === 'crowdfunding'
      ? 'Crowdfunding Email'
      : 'Ecommerce Payment Confirmation Mail'

  const mailData = JSON.parse(await MAILS.get(mailKey))

  const mail = mailData[locale]

  const { Subject, From_name, From_email, htmlEmail } = mail

  const finalHTMLEmail = htmlEmail
    .replaceAll('${first_name}', first_name)
    .replaceAll('${perk}', perk || product_desc)
    .replaceAll('${price}', price)
    .replaceAll('${tax}', tax)
    .replaceAll('${street}', street)
    .replaceAll('${postal_code}', postal_code)
    .replaceAll('${city}', city)
    .replaceAll('${country}', country)

  const name = `${first_name} ${last_name}`

  const BCCRecipients =
    payment_type === 'ecommerce'
      ? [
          { email: 'hello@dilmahtea.me' },
          { email: 'jurjen.devries@dilmahtea.me' },
        ]
      : []

  const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email, name }],
          bcc: BCCRecipients,
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
          value: finalHTMLEmail,
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

    const { getValidatedData } = await import(
      '../../../utils/getValidatedData.js'
    )

    const validatedData = getValidatedData(requestBody)

    if (validatedData.errors) {
      return reply(JSON.stringify(validatedData), 400)
    }

    if (
      validatedData['first_name'] &&
      validatedData['last_name'] &&
      validatedData['email']
    ) {
      return sendEmail(validatedData)
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
