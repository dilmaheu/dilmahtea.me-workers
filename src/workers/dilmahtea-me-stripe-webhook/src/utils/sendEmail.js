// @ts-check

export default async function sendEmail(paymentData, env) {
  const {
    orderNumber,
    domain,
    paymentID,
    paymentBaserowRecordID,
    first_name,
    last_name,
    email,
    favorite_tea,
    country,
    city,
    street,
    postal_code,
    kindness_cause,
    shipping_method,
    shipping_cost,
    perk,
    product_desc,
    cart,
    price,
    tax = 0,
    payment_type,
    locale,
    origin_url,
    success_url,
  } = paymentData;

  const name = `${first_name} ${last_name}`;

  const lineItems = !cart
    ? [[perk, price.toFixed(2).replace(".", ",")]]
    : Object.values(cart).map(({ names, quantity, price }) => [
        quantity + "x " + JSON.parse(names)[locale],
        price.toFixed(2).replace(".", ","),
      ]);

  const mailKey =
    payment_type === "crowdfunding"
      ? "Crowdfunding Email"
      : "Ecommerce Payment Confirmation Mail";

  const mailData = JSON.parse(await env.MAILS.get(mailKey));

  const mail = mailData[locale],
    { Subject, From_name, From_email, htmlEmail } = mail;

  const finalSubject = Subject.replaceAll("<order_no>", orderNumber);

  const finalHTMLEmail = htmlEmail
    .replaceAll("<order_no>", orderNumber)
    .replaceAll("${name}", name)
    .replaceAll("${first_name}", first_name)
    .replaceAll("${perk}", perk || product_desc)
    .replaceAll("${price}", price.toFixed(2).replace(".", ","))
    .replaceAll("${shipping_cost}", shipping_cost?.toFixed(2).replace(".", ","))
    .replaceAll("${tax}", tax.toFixed(2).replace(".", ","))
    .replaceAll("${street}", street)
    .replaceAll("${postal_code}", postal_code)
    .replaceAll("${city}", city)
    .replaceAll("${country}", country)
    .replace(
      "${line_items}",
      lineItems
        .map(([name, price]) =>
          `<tr>
            <td style="vertical-align: middle; padding-top: 15px;">\${name}</td>
            <td
              align="right"
              style="vertical-align: middle; padding-top: 15px; padding-left: 10px;"
            >
              &euro;\${price}
            </td>
          </tr>`
            .replace("${name}", name)
            .replace("${price}", price)
        )
        .join("\n")
    );

  await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email, name }],
          dkim_domain: "dilmahtea.me",
          dkim_selector: "mailchannels",
          dkim_private_key: env.DKIM_PRIVATE_KEY,
        },
      ],
      from: {
        email: From_email,
        name: From_name,
      },
      subject: finalSubject,
      content: [{ type: "text/html", value: finalHTMLEmail }],
    }),
  })
    .then((res) => res.json())
    .then((response) => {
      console.log({ message: "Email sent", response });
    });
}
