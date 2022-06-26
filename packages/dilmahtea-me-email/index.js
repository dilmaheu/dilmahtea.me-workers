/**
 * Respond with hello worker text
 * @param {Request} request
 */
const htmlContent = (first_name) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your funds have been received, successfully</title>
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
            Your funding is successfully received. Thank you for supporting us!
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
              <p>Dear ${first_name},</p>
              <p style="white-space: pre-line">
                This is just a quick email to say that we’ve received your
                payment. Be sure that money will be spent for good deeds and
                you are appreciated contributor. Thank you for your kindness. If
                you have any questions or suggestions, don’t hesitate to drop an
                email at
                <a
                  href="mailto:dilmah@support.com"
                  style="
                    font-style: italic;
                    display: inline;
                    border-bottom: 1px solid #4e878a;
                    text-decoration: none;
                    color: #4e878a;
                  "
                  >dilmah@support.com</a
                >
                and we’ll be happy to assist. Truly yours, Dilmah Team
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
                Funding Summary
              </h2>
              <p style="padding-top: 40px">
                <span style="float: left">Basic</span>
                <span style="float: right">&#36;25</span>
              </p>
              <div style="padding-top: 15px">
                <span style="float: left">Tax</span>
                <span style="float: right">&#36;0</span>
              </div>
              <div
                style="
                  display: block;
                  margin-top: 50px;
                  border: 1px solid rgba(43, 75, 80, 0.3);
                "
              ></div>
              <p style="padding-top: 15px; font-size: 28px; font-weight: 600">
                <span style="float: left">Total</span>
                <span style="float: right">&#36;25</span>
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
                Billing Details
              </h3>
              <address
                style="
                  font-style: normal;
                  line-height: 120%;
                  white-space: pre-line;
                "
              >
                Smiles Davis 600 Montgometry Str San Francisco, CA 94111<br />United
                States
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
        <div style="display: block; text-align: center">
          <a
            href="#"
            style="
              text-underline-offset: 2px;
              text-decoration: underline;
              -webkit-text-decoration-color: rgba(227, 223, 222, 0.5);
              text-decoration-color: rgba(227, 223, 222, 0.7);
              color: #e3dfde;
            "
          >
            Privacy Policy
          </a>
          <span>|</span>
          <a
            href="#"
            style="
              text-underline-offset: 2px;
              text-decoration: underline;
              -webkit-text-decoration-color: rgba(227, 223, 222, 0.5);
              text-decoration-color: rgba(227, 223, 222, 0.7);
              color: #e3dfde;
            "
          >
            Contact Support
          </a>
        </div>
        <div style="margin-top: 15px">
          323 Montgomery Str, Suite 234, Dpt 2354, San Francisco, CA 94111
        </div>
        <div style="margin-top: 15px">
          © 2022 Dilmah Ceylon Tea Company PLC.
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

const sendEmail = async (body) => {
  const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: body.email, name: `${body.first_name} ${body.last_name}` }],
        },
      ],
      from: {
        email: 'hello@dilmahtea.me',
        name: 'Dilmah Tea',
      },
      subject: 'Funds Have Been Confirmed',
      content: [
        {
          type: 'text/html',
          value: htmlContent(body.first_name),
        },
      ],
    }),
  })
  await fetch(send_request).then((res) => res.json())
  return reply(JSON.stringify({sent: true}), 200)
}

const handleRequest = async (request) => {
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

addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname == '/' && request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(request))
  }
  if (url.pathname == '/' && request.method === 'POST') {
    return event.respondWith(handleRequest(request))
  }
  return event.respondWith(
    new Response(`Method or Path Not Allowed`, { headers, status: 405 }),
  )
})