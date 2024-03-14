import env from "../env";

export default async function sendEmail(paymentData) {
  const {
    orderNumber,
    domain,
    paymentID,
    paymentBaserowRecordID,
    first_name,
    last_name,
    email,
    favorite_tea,
    street,
    postal_code,
    city,
    country,
    billing_street,
    billing_postal_code,
    billing_city,
    billing_country,
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
    .replaceAll("${shipping_address}", `${street}, ${postal_code}, ${city}, ${country}`)
    .replaceAll(
      "${billing_address}", 
      `${billing_street}, ${billing_postal_code}, ${billing_city}, ${billing_country}`
    )
    .replace(
      "${line_items}",
      lineItems
        .map(([name, price]) =>
          `<tr>
            <td style="vertical-align:middle;">\${name}</td>

            <td 
              align="right" 
              style="
                vertical-align: middle;
                padding-left: 10px;
                padding-left: clamp(5px, 0.063rem + 0.625vw, 10px);
              "
            >
              &euro;\${price}
            </td>
          </tr>`
            .replace("${name}", name)
            .replace("${price}", price),
        )
        .join("\n"),
    );

  await env.EMAIL.fetch(env.EMAIL_WORKER_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cf-secure-worker-token": env.CF_SECURE_WORKER_TOKEN,
    },
    body: JSON.stringify({
      to: [{ email, name }],
      subject: finalSubject,
      content: [{ type: "text/html", value: finalHTMLEmail }],
    }),
  })
    .then((res) => res.json<any>())
    .then((response) => {
      console.log({
        message: response.success ? "Email sent" : "Email not sent",
        response,
      });
    });
}
