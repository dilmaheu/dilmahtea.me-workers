import type { ENV } from "./types";

import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

declare interface Body {
  to: { email: string; name?: string }[];
  subject: string;
  content: { type: string; value: string }[];
}

async function handlePOST(request: Request, env: ENV) {
  if (request.headers.get("x-secret") !== env.EMAIL_WORKER_SECRET) {
    return reply({ success: false, error: "Unauthorized" }, 401);
  }

  const { to, subject, content } = await request.json<Body>();

  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to,
          dkim_domain: "dilmahtea.me",
          dkim_selector: "mailchannels",
          dkim_private_key: env.DKIM_PRIVATE_KEY,
        },
      ],
      from: {
        name: env.FROM_NAME,
        email: env.FROM_EMAIL,
      },
      subject,
      content,
    }),
  }).then((res) => res.json());

  console.log(response);

  return reply({ success: true }, 200);
}

handlePOST.retry = true;
handlePOST.SECURE_WORKER_ID = "EMAIL";

export default createModuleWorker({
  pathname: "*",
  methods: { POST: handlePOST },
});
