import { ENV, ExtendedError } from "../types";

export default async function sendErrorNotification(
  error: ExtendedError,
  requestID: string,
  env: ENV,
) {
  const constructedMessage = {
    msgtype: "m.text",
    body:
      error.subject +
      "; Cloudflare Request ID: " +
      requestID +
      "; Check Dev & Sales Inbox for more details.",
  };

  const matrixRequestUrl = `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(
    env.MATRIX_ROOM_ID,
  )}/send/m.room.message?access_token=${env.MATRIX_BOT_ACCESS_TOKEN}`;

  await fetch(matrixRequestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(constructedMessage),
  }).then(async (res) => {
    console.log(await res.json());
  });
}
