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

async function handlePOST(request) {
  const { event, model } = await request.json()

  if (['entry.update', 'entry.publish'].includes(event)) {
    if (model === 'crowdfunding-email') {
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

      const englishCrowdfundingEmail =
          data.englishCrowdfundingEmail.data.attributes,
        dutchCrowdfundingEmail = data.dutchCrowdfundingEmail.data.attributes,
        recurringElement = data.recurringElement.data.attributes

      const crowdfundingEmailData = {
        locales: {
          en: englishCrowdfundingEmail,
          nl: dutchCrowdfundingEmail,
        },
        ...recurringElement,
      }

      await CROWDFUNDING_EMAIL.put(
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
        message: 'Crowdfunding Email has not Triggered the Webhook Event',
      }),
      200,
    )
  }

  return reply(JSON.stringify({ error: 'Bad Request' }), 400)
}

function handleOptions(request) {
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
        return event.respondWith(handleOptions(request))
    }
  }

  return event.respondWith(
    reply(JSON.stringify({ error: `Method or Path Not Allowed` }), 405),
  )
})
