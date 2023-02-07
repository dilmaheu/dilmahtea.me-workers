export default async function sendEmail(data) {
  const {
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
    product_name,
    product_desc,
    cart,
    price,
    tax = 0,
    payment_type,
    locale,
    origin_url,
    success_url,
  } = data

  const mailKey =
    payment_type === 'crowdfunding'
      ? 'Crowdfunding Email'
      : 'Ecommerce Payment Confirmation Mail'

  const mailData = JSON.parse(await MAILS.get(mailKey))

  const mail = mailData[locale]

  const { Subject, From_name, From_email, htmlEmail } = mail

  const finalHTMLEmail = htmlEmail
    .replaceAll('${first_name}', first_name)
    .replaceAll('${perk}', perk || product_desc)
    .replaceAll('${price}', price)
    .replaceAll('${tax}', tax)
    .replaceAll('${street}', street)
    .replaceAll('${postal_code}', postal_code)
    .replaceAll('${city}', city)
    .replaceAll('${country}', country)

  const name = `${first_name} ${last_name}`

  const BCCRecipients =
    payment_type === 'ecommerce'
      ? [
          { email: 'hello@dilmahtea.me' },
          { email: 'jurjen.devries@dilmahtea.me' },
        ]
      : []

  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email, name }],
          bcc: BCCRecipients,
          dkim_domain: 'dilmahtea.me',
          dkim_selector: 'mailchannels',
          dkim_private_key: DKIM_PRIVATE_KEY,
        },
      ],
      from: {
        email: From_email,
        name: From_name,
      },
      subject: Subject,
      content: [
        {
          type: 'text/html',
          value: finalHTMLEmail,
        },
      ],
    }),
  }).then(res => res.json())

  console.log(response)
}
