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

async function handleGET(request) {
  const supportersCount = await BASEROW_STATS.get('Number of Supporters'),
    totalAmountRaised = await BASEROW_STATS.get('Total Amount Raised')

  return reply(
    JSON.stringify({
      supportersCount,
      totalAmountRaised,
    }),
    200,
  )
}

async function handlePOST(request) {
  const { table_id, event_type } = await request.json()

  if (
    table_id === 67746 &&
    ['rows.created', 'rows.updated', 'rows.deleted'].includes(event_type)
  ) {
    const { results: payments } = await fetch(
      `https://api.baserow.io/api/database/rows/table/67746/?user_field_names=true&size=0&include=Amount+Paid,Payment+Status`,
      {
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
        },
      },
    ).then(res => res.json())

    const paidPayments = payments.filter(
      row => row['Payment Status'] === 'paid',
    )

    const supportersCount = paidPayments.length

    const initialAmount = 0

    const totalAmountRaised = paidPayments.reduce(
      (total, payment) => total + parseInt(payment['Amount Paid']),
      initialAmount,
    )

    await BASEROW_STATS.put('Number of Supporters', supportersCount)
    await BASEROW_STATS.put('Total Amount Raised', totalAmountRaised)

    return reply(
      JSON.stringify({ message: 'BASEROW_STATS KV Namespace Updated' }),
      200,
    )
  } else {
    return reply(JSON.stringify({ error: 'Bad request' }), 400)
  }
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

  let { pathname: urlPathname } = new URL(request.url)

  if (urlPathname.endsWith('/')) {
    urlPathname = urlPathname.slice(0, -1)
  }

  if (urlPathname === '/crowdfunding-stats') {
    switch (request.method) {
      case 'GET':
        return event.respondWith(handleGET(request))
      case 'POST':
        return event.respondWith(handlePOST(request))
      case 'OPTIONS':
        return event.respondWith(handleOptions(request))
      default:
        return event.respondWith(
          reply(JSON.stringify({ error: `Method or Path Not Allowed` }), 405),
        )
    }
  }
})