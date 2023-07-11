// @ts-check

import getCountryCode from "./getCountryCode";
import createExactOrder from "./createExactOrder";
import createDimassOrder from "./createDimassOrder";
import updateBaserowRecord from "./updateBaserowRecord";

export default async function createOrder(paymentData, env) {
  const {
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
    product_name,
    product_desc,
    cart,
    price,
    tax,
    payment_type,
    locale,
    origin_url,
    success_url,
  } = paymentData;

  paymentData.countryCode = await getCountryCode(country, env);

  const salesOrder = await createExactOrder(paymentData, env);

  const orderNumber = salesOrder.entry.content["m:properties"]["d:OrderNumber"];

  await createDimassOrder({ ...paymentData, orderNumber }, env);

  await updateBaserowRecord(
    paymentBaserowRecordID,
    { "Order Status": "Confirmed" },
    payment_type,
    env
  );
}
