import sendEmail from "./sendEmail";
import getCountryCode from "./getCountryCode";
import createD1Record from "./createD1Record";
import createExactOrder from "./createExactOrder";
import createDimassOrder from "./createDimassOrder";
import updateBaserowRecord from "./updateBaserowRecord";

import rethrow from "../../../../utils/rethrow";
import throwExtendedError from "../../../../utils/throwExtendedError";

import context from "../context";

export default async function createOrder(paymentData, request) {
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
    context.salesOrder ||= await createExactOrder(paymentData, request).catch(
      (error) => rethrow(error, "Exact"),
    );

    const { "d:OrderNumber": orderNumber, "d:Created": order_date } =
      context.salesOrder.entry.content["m:properties"];

    if (!context.hasCreatedD1Record) {
      await createD1Record(email, cart, orderNumber, order_date);

      context.hasCreatedD1Record = true;
    }

    if (!context.hasCreatedDimassOrder) {
      await createDimassOrder({ ...paymentData, orderNumber }).catch((error) =>
        rethrow(error, "Dimass"),
      );

      context.hasCreatedDimassOrder = true;
    }

    const promises = [];

    if (!context.hasSentEmail) {
      promises.push(
        sendEmail({ orderNumber, ...paymentData }).then(() => {
          context.hasSentEmail = true;
        }),
      );
    }

    if (!context.hasConfirmedOrderStatus) {
      promises.push(
        updateBaserowRecord(
          paymentBaserowRecordID,
          { "Order Number": orderNumber, "Order Status": "Confirmed" },
          payment_type,
        ).then(() => {
          context.hasConfirmedOrderStatus = true;
        }),
      );
    }

    await Promise.all(promises);
  } catch (error) {
    await throwExtendedError({
      error,
      notifySales: true,
      requestData: { PaymentID: paymentID },
      subject: `${error.platform}: Error creating order`,
      bodyText: `An error was thrown while creating order in ${error.platform}. Please manually confirm the order.`,
    });
  }
}
