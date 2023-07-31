// @ts-check

import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function handlePATCH(request, env) {
  const { paymentID, payment_type, ...updatedData } = await request.json();

  const PAYMENT_INTENTS =
    payment_type === "crowdfunding"
      ? env.CROWDFUNDINGS
      : env.ECOMMERCE_PAYMENTS;

  const paymentIntentData = JSON.parse(await PAYMENT_INTENTS.get(paymentID)),
    { paymentBaserowRecordID: rowID } = paymentIntentData;

  const databaseTableID =
    payment_type === "crowdfunding"
      ? env.BASEROW_CROWDFUNDING_TABLE_ID
      : payment_type === "ecommerce"
      ? env.BASEROW_PAYMENT_RECORDS_TABLE_ID
      : null;

  const sendBaserowRequest = () =>
    fetch(
      `https://api.baserow.io/api/database/rows/table/${databaseTableID}/${rowID}/?user_field_names=true`,
      {
        method: "PATCH",
        body: JSON.stringify(updatedData),
        headers: {
          Authorization: `Token ${env.BASEROW_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());

  const response = await sendBaserowRequest();

  return reply(
    {
      message: `Baserow record ${response.id} ${rowID ? "updated" : "created"}`,
      response,
    },
    200
  );
}

export default createModuleWorker({
  pathname: "/",
  methods: { PATCH: handlePATCH },
});
