import type { ENV, ExtendedError } from "../types";

export default function sendErrorEmail(
  error: undefined | ExtendedError,
  requestID: string,
  env: ENV,
) {
  let notifySales, subject, body;

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

  return fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [
            { email: env.DEV_EMAIL },
            notifySales && { email: env.SALES_EMAIL },
          ].filter(Boolean),
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
      content: [
        {
          type: "text/plain",
          value: body,
        },
      ],
    }),
  }).then(async (res) => {
    console.log(await res.json());
  });
}
