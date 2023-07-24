// @ts-check

import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function handlePOST(request, env) {
  const roomId = env.ROOM_ID,
    matrixBotAccessToken = env.MATRIX_BOT_ACCESS_TOKEN;

  if (!roomId || !matrixBotAccessToken) {
    return new Response("Missing environment variables", { status: 500 });
  }

  const body = await request.arrayBuffer(),
    signature = await request.headers.get("x-hub-signature-256");

  const expectedSignature = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(env.WEBHOOK_SECRET + body)
  );

  if (
    "sha256=" + new TextDecoder("hex").decode(expectedSignature) !==
    signature
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const webhookPayload = await request.json();

  let message = "";

  if (
    // Check if the PR was merged
    webhookPayload.pull_request?.state === "closed" &&
    webhookPayload.pull_request?.merged === true
  ) {
    const { number: pullRequestNumber, html_url: pullRequestUrl } =
      webhookPayload.pull_request;

    message = `PR Merge #${pullRequestNumber} done. ${pullRequestUrl}`;
  } else if (
    // Check if the build failed on the main branch
    webhookPayload.check_run?.conclusion === "failure" &&
    webhookPayload.check_run?.check_suite?.head_branch === "main"
  ) {
    message = `Build failure. Please check in detail by ${webhookPayload.check_run.html_url}. Please add 👍 or reply to this message when you have taken action so the team is aware.`;
  } else {
    // Return a 200 status for other cases
    return reply("No action required", 200);
  }

  const matrixApiUrl = `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(
    roomId
  )}/send/m.room.message`;

  // Define the fetch options for the Matrix API request
  const matrixRequestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${matrixBotAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      msgtype: "m.text",
      body: message,
    }),
  };

  let matrixResponse;
  // Try to send the message to the Matrix room
  try {
    matrixResponse = await fetch(matrixApiUrl, matrixRequestOptions);
  } catch (error) {
    // If the fetch fails, return a 500 status
    return reply("Failed to send message", 500);
  }

  // Check if the Matrix API request was successful
  if (!matrixResponse.ok) {
    return reply(
      `Failed to send message: ${matrixResponse.status} ${matrixResponse.statusText}`,
      500
    );
  }

  // If everything went well, return a 200 status
  return reply("Message sent", 200);
}

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
