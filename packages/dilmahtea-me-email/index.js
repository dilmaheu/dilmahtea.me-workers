/**
 * Respond with hello worker text
 * @param {Request} request
 */

const htmlContent = (
  first_name,
  perk,
  price,
  country,
  city,
  street,
  postal_code,
) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Je betaling is succesvol ontvangen. Dank hiervoor!</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Alice&family=Roboto&display=swap"
        rel="stylesheet"
      />
    </head>
    <body style="padding: 0; margin: 0">
      <!-- Background Section -->
      <div
        style="
        position: relative;
        display: block;
        background-image: url(https://imagedelivery.net/BX3RwoS0OdbsyY2M52BQzw/7fa35dcb-abd3-41df-4711-3b9cac1b0500/opengraph);
        background-repeat: no-repeat;
        background-size: 100% 100%;
        height: 160px;
        object-fit: cover;
        overflow: hidden;
      "
      >
        <img
          src="https://imagedelivery.net/BX3RwoS0OdbsyY2M52BQzw/c49ecab8-5548-4d65-41e8-efa0e59fb000/opengraph"
          alt="Dilmah Tea Logo"
          style="display: block; height: 100px; margin: 30px auto auto"
        />
      </div>

      <div
        role="main"
        style="display: block; justify-content: center; background-color: #2b4b50"
      >
        <div
          style="
          display: block;
          text-align: center;
          padding: 0 20px;
          margin: 0 auto;
        "
        >
          <div style="display: block; margin: 0 auto; max-width: 490px">
            <h1
              style="
              max-width: 490px;
              padding: 45px 0;
              margin: auto;
              font-family: Alice;
              font-size: 24px;
              font-weight: 400;
              line-height: 120%;
              text-align: center;
              color: #e3dfde;
            "
            >
              Je betaling is succesvol ontvangen.
              <br />Dank hiervoor!
            </h1>
          </div>

          <!-- Text content -->
          <div style="display: block; margin: 0 auto; max-width: 490px">
            <div
              style="
              font-family: Roboto;
              font-size: 20px;
              font-weight: 500;
              line-height: 140%;
              letter-spacing: -0.02em;
              text-align: left;
            "
            >
              <div
                style="
                background: #e3dfde;
                border-radius: 15px;
                max-width: 100%;
                padding: 28px 24px;
                margin-bottom: 40px;
                color: #000;
              "
              >
                <p>Beste ${first_name},</p>
                <p>
                  Graag bevestigen we dat we jouw betaling in goede orde hebben ontvangen.
                </p>
                <p>
                  Nogmaals dank voor jouw verrtouwen en bijdrage aan een Sri Lankaans familiebedrijf. Alle opbrengsten van jouw kopje thee gaan terug naar de bron waar wij, Sri Lankanen, de mensheid, de ecologie en onze lokale economie ondersteunen.
                </p>
                <p>
                  Binnen een week ontvang je een mail met alle belangrijke informatie rondom jouw bijdrage aan onze crowdfunding.
                </p>
                <p>                
                  Mocht je vragen of suggesties hebben, aarzel dan niet om een e-mail te sturen naar <a
                    href="mailto:hello@dilmahtea.me"
                    style="font-style: italic;display: inline;border-bottom: 1px solid #4e878a;text-decoration: none;color: #4e878a;"
                    >hello@dilmahtea.me</a
                  > en wij staan voor je klaar.
                </p>
                <p>
                  Met de hartelijkste groetjes,
                  <br />Team Dilmah
                </p>
              </div>

              <div
                style="
                background: #e3dfde;
                border-radius: 15px;
                max-width: 100%;
                margin-bottom: 40px;
                padding: 28px 24px;
                color: #2b4b50;
              "
              >
                <h2 style="font-weight: 600; line-height: 140%">
                  Besteloverzicht
                </h2>
                <p style="padding-top: 40px">
                  <span style="float: left">${perk}</span>
                  <span style="float: right">&euro;${price}</span>
                </p>
                <div style="padding-top: 15px">
                  <span style="float: left">BTW</span>
                  <span style="float: right">&euro;0</span>
                </div>
                <div
                  style="
                  display: block;
                  margin-top: 50px;
                  border: 1px solid rgba(43, 75, 80, 0.3);
                "
                ></div>
                <p style="padding-top: 15px; font-size: 28px; font-weight: 600">
                  <span style="float: left">Totaal</span>
                  <span style="float: right">&euro;${price}</span>
                </p>
              </div>

              <div
                style="
                background: #e3dfde;
                border-radius: 15px;
                max-width: 100%;
                padding: 28px 24px;
                color: #2b4b50;
              "
              >
                <h3 style="font-weight: 600; line-height: 120%">
                  Factuurgegevens
                </h3>
                <address
                  style="
                  font-style: normal;
                  line-height: 120%;
                  white-space: pre-line;
                "
                >
                  ${street}<br />${postal_code} ${city}<br />${country}
                </address>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Section -->
      <div style="display: block; background-color: #2b4b50">
        <div
          style="
          display: block;
          max-width: 490px;
          padding: 40px 0;
          margin: auto;
          font-family: Roboto;
          font-size: 16px;
          font-weight: 500;
          line-height: 162%;
          text-align: center;
          color: #e3dfde;
        "
          role="contentinfo"
        >
          <div style="margin-top: 15px">
            Postjesweg 1, 1057 DT Amsterdam, The Netherlands
          </div>
          <div style="margin-top: 15px">
            © 2022 Dilmah Europe B.V.
          </div>
        </div>
      </div>
    </body>
  </html>
`

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

  const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: email, name: `${first_name} ${last_name}` }],
        },
      ],
      from: {
        email: 'hello@dilmahtea.me',
        name: 'Dilmah Europe',
      },
      subject: 'Crowdfunding betaalbevestiging',
      content: [
        {
          type: 'text/html',
          value: htmlContent(
            first_name,
            perk,
            price,
            country,
            city,
            street,
            postal_code,
          ),
        },
      ],
    }),
  })

  await fetch(send_request).then(res => res.json())

  return reply(JSON.stringify({ sent: true }), 200)
}

const handleRequest = async request => {
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

  let { pathname: urlPathname } = new URL(request.url)

  if (urlPathname.endsWith('/')) {
    urlPathname = urlPathname.slice(0, -1)
  }

  if (urlPathname === '/crowdfunding-mail' && request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(request))
  }

  if (urlPathname === '/crowdfunding-mail' && request.method === 'POST') {
    return event.respondWith(handleRequest(request))
  }

  return event.respondWith(
    new Response(JSON.stringify({ error: `Method or Path Not Allowed` }), {
      headers,
      status: 405,
    }),
  )
})
