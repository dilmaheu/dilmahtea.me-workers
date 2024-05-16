import type { ENV, ExtendedError } from "../types";

import D1Strapi from "../../../../utils/D1Strapi";

export default async function sendErrorEmail(
  error: undefined | ExtendedError,
  requestID: string,
  env: ENV,
) {
  let notifySales, subject, body;

  // @ts-ignore
  const { recurringElement } = await D1Strapi(env);

  const { DEV_EMAIL, SALES_EMAIL } = recurringElement.data.attributes;

  if (error) {
    const { message, bodyText, responseData } = error;

    const requestData = {
      Error: message,
      ...error.requestData,
    };

    notifySales = error.notifySales;

    subject = error.subject + " #" + requestID;

    body =
      bodyText +
      "\n\n" +
      Object.entries(requestData)
        .map(([key, value]) => key + ": " + value)
        .join("\n") +
      (!responseData ? "" : "\n\n" + JSON.stringify(responseData, null, 2));
  } else {
    subject = "Request #" + requestID + " retry succeded";

    body = "Request #" + requestID + " retry completed successfully.";
  }

  return await env.EMAIL.fetch(env.EMAIL_WORKER_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cf-secure-worker-token": env.CF_SECURE_WORKER_TOKEN,
    },
    body: JSON.stringify({
      to: [{ email: DEV_EMAIL }, notifySales && { email: SALES_EMAIL }].filter(
        Boolean,
      ),
      subject,
      content: [{ type: "text/plain", value: body }],
    }),
  })
    .then(async (res) => res.json<any>())
    .then((response) => {
      console.log({
        message: response.success ? "Email sent" : "Email not sent",
        response,
      });
    });
}
