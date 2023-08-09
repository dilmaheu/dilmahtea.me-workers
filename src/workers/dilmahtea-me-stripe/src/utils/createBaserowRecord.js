// @ts-check

export default async function createBaserowRecord(paymentIntentData, env) {
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
    product_desc,
    cart,
    price,
    tax,
    payment_type,
    locale,
    origin_url,
    success_url,
    paymentID,
    payment_status,
  } = paymentIntentData;

  const databaseTableID =
    payment_type === "crowdfunding"
      ? env.BASEROW_CROWDFUNDING_TABLE_ID
      : payment_type === "ecommerce"
      ? env.BASEROW_PAYMENT_RECORDS_TABLE_ID
      : null;

  const createRecordRequestBody = {
    "First Name": first_name,
    "Last Name": last_name,
    Email: email,
    "Favorite Tea": favorite_tea,
    Country: country,
    City: city,
    Street: street,
    "Postal Code": postal_code,
    "Payment ID": paymentID,
    "Order Description": product_desc,
    "Cup of Kindness": kindness_cause,
    "Shipping Method": shipping_method,
    "Shipping Cost": shipping_cost,
    Perk: perk,
    "Amount Paid": price,
    "Total Tax": tax,
    Locale: locale,
    "Payment Status": payment_status,
  };

  const response = await fetch(
    `https://api.baserow.io/api/database/rows/table/${databaseTableID}/?user_field_names=true`,
    {
      method: "POST",
      body: JSON.stringify(createRecordRequestBody),
      headers: {
        Authorization: `Token ${env.BASEROW_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());

  console.log({ message: `Baserow record ${response.id} created`, response });

  return response;
}
