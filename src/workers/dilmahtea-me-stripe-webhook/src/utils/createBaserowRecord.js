export default async function createBaserowRecord(data) {
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
    tax,
    payment_type,
    locale,
    origin_url,
    success_url,
    payment_status,
    payment_intent_id,
  } = data

  const databaseTableID =
    payment_type === 'crowdfunding'
      ? 67746
      : payment_type === 'ecommerce'
      ? 108632
      : null

  const createRecordRequestBody = {
    'First Name': first_name,
    'Last Name': last_name,
    Email: email,
    'Favorite Tea': favorite_tea,
    Country: country,
    City: city,
    Street: street,
    'Postal Code': postal_code,
    'Payment Intent ID': payment_intent_id,
    'Order Description': product_desc,
    'Cup of Kindness': kindness_cause,
    'Shipping Method': shipping_method,
    'Shipping Cost': shipping_cost,
    Perk: perk,
    'Amount Paid': price,
    'Total Tax': tax,
    Locale: locale,
    'Payment Status': payment_status,
  }

  const response = await fetch(
    `https://api.baserow.io/api/database/rows/table/${databaseTableID}/?user_field_names=true`,
    {
      method: 'POST',
      body: JSON.stringify(createRecordRequestBody),
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  ).then(res => res.json())

  console.log(response)
}
