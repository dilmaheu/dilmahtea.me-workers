// Define the event listener for fetch events
addEventListener('fetch', (event) => {
  // Respond with the result of the handleRequest function
  event.respondWith(handleRequest(event.request));
});

// Asynchronous function to handle incoming requests
async function handleRequest(request) {
  // Check if the request method is POST, otherwise return a 405 status
  if (request.method !== 'POST') {
    return new Response('Expected POST', { status: 405 });
  }

  let webhookPayload;
  // Try to parse the request body as JSON
  try {
    webhookPayload = await request.json();
  } catch (error) {
    // If the JSON parsing fails, return a 400 status
    return new Response('Invalid JSON', { status: 400 });
  }

  // Check if the required fields are present in the payload
  if (
    webhookPayload.pull_request &&
    webhookPayload.pull_request.state === 'closed' &&
    webhookPayload.pull_request.merged === true
  ) {
    const matrixBotAccessToken = MATRIX_BOT_ACCESS_TOKEN;
    const roomId = ROOM_ID;

    if (!matrixBotAccessToken || !roomId) {
      return new Response('Missing environment variables', { status: 500 });
    }

    const matrixApiUrl = `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(
      roomId
    )}/send/m.room.message`;

    const pullRequestNumber = webhookPayload.pull_request.number;
    const pullRequestUrl = webhookPayload.pull_request.html_url;

    const message = `PR Merge #${pullRequestNumber} done. ${pullRequestUrl}`;

    // Define the fetch options for the Matrix API request
    const matrixRequestOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${matrixBotAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msgtype: 'm.text',
        body: message,
      }),
    };

    let matrixResponse;
    // Try to send the message to the Matrix room
    try {
      matrixResponse = await fetch(matrixApiUrl, matrixRequestOptions);
    } catch (error) {
      // If the fetch fails, return a 500 status
      return new Response('Failed to send message', { status: 500 });
    }

    // Check if the Matrix API request was successful
    if (!matrixResponse.ok) {
      return new Response(
        `Failed to send message: ${matrixResponse.status} ${matrixResponse.statusText}`,
        { status: 500 }
      );
    }

    // If everything went well, return a 200 status
    return new Response('Message sent', { status: 200 });
  }

  // Check if the build failed on the main branch
  if (
    webhookPayload.check_run &&
    webhookPayload.check_run.check_suite &&
    webhookPayload.check_run.conclusion === 'failure' &&
    webhookPayload.check_run.check_suite.head_branch === 'main'
  ) {
    // Get the Matrix bot access token and roomId from the environment variables
    const matrixBotAccessToken = MATRIX_BOT_ACCESS_TOKEN;
    const roomId = ROOM_ID;

    if (!matrixBotAccessToken || !roomId) {
      return new Response('Missing environment variables', { status: 500 });
    }

    const matrixApiUrl = `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(
      roomId
    )}/send/m.room.message`;

    // Define the fetch options for the Matrix API request
    const matrixRequestOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${matrixBotAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msgtype: 'm.text',
        body: `Build failure. Please check in detail by ${webhookPayload.check_run.html_url}. Please add 👍 or reply to this message when you have taken action so the team is aware.`,
      }),
    };

    let matrixResponse;
    // Try to send the message to the Matrix room
    try {
      matrixResponse = await fetch(matrixApiUrl, matrixRequestOptions);
    } catch (error) {
      // If the fetch fails, return a 500 status
      return new Response('Failed to send message', { status: 500 });
    }

    // Check if the Matrix API request was successful
    if (!matrixResponse.ok) {
      return new Response(
        `Failed to send message: ${matrixResponse.status} ${matrixResponse.statusText}`,
        { status: 500 }
      );
    }

    // If everything went well, return a 200 status
    return new Response('Message sent', { status: 200 });
  }

  // Return a 200 status for other cases
  return new Response('No action required', { status: 200 });
}
