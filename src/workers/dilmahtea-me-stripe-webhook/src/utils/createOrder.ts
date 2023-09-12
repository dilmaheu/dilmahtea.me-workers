import sendEmail from "./sendEmail";
import getCountryCode from "./getCountryCode";
import createExactOrder from "./createExactOrder";
import createDimassOrder from "./createDimassOrder";
import updateBaserowRecord from "./updateBaserowRecord";

import sendErrorEmail from "../../../../utils/sendErrorEmail";

export default async function createOrder(paymentData) {
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
    product_desc,
    cart,
    price,
    tax,
    payment_type,
    locale,
    origin_url,
    success_url,
  } = paymentData;

  paymentData.countryCode = await getCountryCode(country);

  try {
    const salesOrder = await createExactOrder(paymentData).catch((error) => {
      error.platform = "Exact";

      throw error;
    });

    const orderNumber =
      salesOrder.entry.content["m:properties"]["d:OrderNumber"];

    await createDimassOrder({ ...paymentData, orderNumber }).catch((error) => {
      error.platform = "Dimass";

      throw error;
    });

    await Promise.all([
      sendEmail({ orderNumber, ...paymentData }),
      updateBaserowRecord(
        paymentBaserowRecordID,
        { "Order Number": orderNumber, "Order Status": "Confirmed" },
        payment_type,
      ),
    ]);
  } catch (error) {
    error.creation = "order";

    await sendErrorEmail(error, { paymentID });
  }
}
