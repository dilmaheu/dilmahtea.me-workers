// @ts-check

const sendErrorEmail = (error, { orderNumber = null, paymentID = null }, env) =>
  fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [
            {
              email:
                env.ENVIRONMENT === "PRODUCTION"
                  ? "hello@dilmahtea.me"
                  : "dev@dilmahtea.me",
            },
          ],
          dkim_domain: "dilmahtea.me",
          dkim_selector: "mailchannels",
          dkim_private_key: env.DKIM_PRIVATE_KEY,
        },
      ],
      from: {
        email: "hello@dilmahtea.me",
        name: "Dilmah Europe",
      },
      subject: `Error creating ${error.platform} order`,
      content: [
        {
          type: "text/plain",
          value: `
            An error happened while creating an order at ${
              error.platform
            }. Please manually confirm the order.

            Error: ${error.message}
            ${
              orderNumber
                ? `Order number: ${orderNumber}`
                : `Payment ID: ${paymentID}`
            }
          `
            // just for prettiying the email
            .replace(/\n +/g, "\n")
            .slice(1, -1),
        },
      ],
    }),
  });

export default sendErrorEmail;