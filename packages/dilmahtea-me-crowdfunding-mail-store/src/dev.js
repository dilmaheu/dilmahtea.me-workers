/**
 * Respond with hello worker text
 * @param {Request} request
 */

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

const getHTMLEmail = (
  Overview,
  Total,
  Invoice,
  VAT,
  Company_address,
  previewText,
  preheaderText,
  bodyText,
  footerText,
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
      <!-- Preview Text -->
      <div style="display: none;"><${previewText}></div>

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
          <!-- Preheader Text -->
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
              ${preheaderText}
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
                ${bodyText}
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
                  ${Overview}
                </h2>
                <p style="padding-top: 40px">
                  <span style="float: left">\${perk}</span>
                  <span style="float: right">&euro;\${price}</span>
                </p>
                <div style="padding-top: 15px">
                  <span style="float: left">${VAT}</span>
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
                  <span style="float: left">${Total}</span>
                  <span style="float: right">&euro;\${price}</span>
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
                  ${Invoice}
                </h3>
                <address
                  style="
                  font-style: normal;
                  line-height: 120%;
                  white-space: pre-line;
                "
                >
                  \${street}<br />\${postal_code} \${city}<br />\${country}
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
            ${Company_address}
          </div>
          <div style="margin-top: 15px">
            ${footerText}
          </div>
        </div>
      </div>
    </body>
  </html>
`

async function handlePOST(request) {
  const { event, model } = await request.json()

  if (['entry.update', 'entry.publish'].includes(event)) {
    if (['crowdfunding-email', 'recurring-element'].includes(model)) {
      const query = `
        {
          englishCrowdfundingEmail: crowdfundingEmail(locale: "en") {
            data {
              attributes {
                From_name
                From_email
                Subject
                Preview_text
                Preheader_text
                Body
                Overview
                Total
                Invoice
                VAT
              }
            }
          }

          dutchCrowdfundingEmail: crowdfundingEmail(locale: "nl-NL") {
            data {
              attributes {
                From_name
                From_email
                Subject
                Preview_text
                Preheader_text
                Body
                Overview
                Total
                Invoice
                VAT
              }
            }
          }

          recurringElement {
            data {
              attributes {
                Footer_text
                Company_address
              }
            }
          }
        }
      `

      const response = await fetch(CMS_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CMS_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          query,
        }),
      })

      const { data } = await response.json()

      const {
        Footer_text,
        Company_address,
      } = data.recurringElement.data.attributes

      const footerText = Footer_text.replaceAll(
        '<current_year>',
        new Date().getFullYear(),
      )

      const [englishCrowdfundingEmail, dutchCrowdfundingEmail] = [
        data.englishCrowdfundingEmail.data.attributes,
        data.dutchCrowdfundingEmail.data.attributes,
      ].map(mail => {
        const {
          From_name,
          From_email,
          Subject,
          Preview_text,
          Preheader_text,
          Body,
          Overview,
          Total,
          Invoice,
          VAT,
        } = mail

        const previewText = Preview_text + '&nbsp;'.repeat(100),
          preheaderText = Preheader_text.replaceAll('\n', '<br />'),
          bodyText = Body.replaceAll('\n', '<br />')
            .replaceAll('<first_name>', '${first_name}')
            .replaceAll(
              '<from_email>',
              `
            <a
              href="mailto:${From_email}"
              style="font-style: italic;display: inline;border-bottom: 1px solid #4e878a;text-decoration: none;color: #4e878a;"
              >${From_email}</a
            >
          `,
            )

        const htmlEmail = getHTMLEmail(
          Overview,
          Total,
          Invoice,
          VAT,
          Company_address,
          previewText,
          preheaderText,
          bodyText,
          footerText,
        )

        return {
          Subject,
          From_name,
          From_email,
          htmlEmail,
        }
      })

      const crowdfundingEmailData = {
        en: englishCrowdfundingEmail,
        nl: dutchCrowdfundingEmail,
      }

      await MAILS.put(
        'Crowdfunding Email',
        JSON.stringify(crowdfundingEmailData),
      )

      return reply(
        JSON.stringify({ message: 'Crowdfunding Email Saved to KV Namespace' }),
        200,
      )
    }

    return reply(
      JSON.stringify({
        message: "Crowdfunding Email doesn't have to be Updated",
      }),
      200,
    )
  }

  return reply(JSON.stringify({ error: 'Bad Request' }), 400)
}

function handleOPTIONS(request) {
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

  let { pathname } = new URL(request.url)

  if (pathname === '/') {
    switch (request.method) {
      case 'POST':
        return event.respondWith(handlePOST(request))
      case 'OPTIONS':
        return event.respondWith(handleOPTIONS(request))
    }
  }

  return event.respondWith(
    reply(JSON.stringify({ error: `Method or Path Not Allowed` }), 405),
  )
})
