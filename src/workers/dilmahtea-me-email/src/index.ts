import type { ENV } from "./types";

import D1Strapi from "../../../utils/D1Strapi";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

declare interface Body {
  to: { email: string; name?: string }[];
  subject: string;
  content: { type: string; value: string }[];
}

async function handlePOST(request: Request, env: ENV) {
  const { to, subject, content } = await request.json<Body>();

  const { recurringElement } = await D1Strapi();

  const { From_name: FROM_NAME, Company_email: FROM_EMAIL } =
    recurringElement.data.attributes;

  if (
    request.headers.get("x-cf-secure-worker-token") !==
    env.CF_SECURE_WORKER_TOKEN
  ) {
    return reply({ success: false, error: "Unauthorized" }, 401);
  }

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
        name: FROM_NAME,
        email: FROM_EMAIL,
      },
      subject,
      content,
    }),
  }).then((res) => res.json<null | { errors: string[] }>());

  if (response?.errors) {
    throw new Error(response.errors.join("; "));
  }

  return reply({ success: true }, 200);
}

handlePOST.retry = true;

export default createModuleWorker({
  pathname: "*",
  methods: { POST: handlePOST },
});
