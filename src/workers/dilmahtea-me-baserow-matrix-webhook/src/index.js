addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    if (request.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Check for 'Webhook-Secret' header in the incoming request
    const incomingWebhookSecret = request.headers.get('Webhook-Secret');
    if (!incomingWebhookSecret || incomingWebhookSecret !== WEBHOOK_SECRET) {
      throw new Error('Invalid webhook secret');
    }

    const incomingRequestBody = await request.json();

    if (
      !incomingRequestBody.items ||
      !Array.isArray(incomingRequestBody.items) ||
      incomingRequestBody.items.length === 0 ||
      !incomingRequestBody.table_id
    ) {
      throw new Error('Missing required fields in payload');
    }

    const firstItemInPayload = incomingRequestBody.items[0];

    if (
      firstItemInPayload.id === undefined ||
      firstItemInPayload.Country === undefined ||
      firstItemInPayload.City === undefined ||
      firstItemInPayload['Cup of Kindness'] === undefined ||
      firstItemInPayload['Payment Status'] === undefined ||
      firstItemInPayload['Order Status'] === undefined
    ) {
      throw new Error('Missing required fields in payload item');
    }

    // Send message only when "Payment Status" is "paid" and "Order Status" is "Confirmed"
    if (
      firstItemInPayload['Payment Status'] !== 'paid' ||
      firstItemInPayload['Order Status'] !== 'Confirmed'
    ) {
      return new Response('Condition not met', {status: 200});
    }

    let messagePrefix, messagePostfix = '';

    if (incomingRequestBody.table_id === 159736) {
      messagePrefix = 'Dev: ';
    } else if (incomingRequestBody.table_id === 108632) {
      messagePrefix = 'Production: ';
      messagePostfix = ' 🎉';
    } else {
      throw new Error('Invalid table_id');
    }

    const constructedMessage = {
      'msgtype': 'm.text',
      'body': `${messagePrefix}New order - ID: ${firstItemInPayload.id}, City: ${firstItemInPayload.City}, Country: ${firstItemInPayload.Country}. Purpose: ${firstItemInPayload['Cup of Kindness']}${messagePostfix}`
    }

    const matrixServerUrl = MATRIX_SERVER_URL
    const matrixRoomId = MATRIX_ROOM_ID 
    const matrixBotAccessToken = MATRIX_BOT_ACCESS_TOKEN 

    const matrixRequestUrl = `${matrixServerUrl}/_matrix/client/r0/rooms/${encodeURIComponent(matrixRoomId)}/send/m.room.message?access_token=${matrixBotAccessToken}`;

    const matrixResponse = await fetch(
      matrixRequestUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constructedMessage)
      }
    )

    if (!matrixResponse.ok) {
      throw new Error(`Matrix API responded with status ${matrixResponse.status}`);
    }

    return new Response('Message sent', {status: 200})

  } catch (error) {
    return new Response(`Error: ${error.message}`, {status: 500})
  }
}
