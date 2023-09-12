import env from "../env";

export default async function updateBaserowRecord(
  rowID,
  updatedData,
  payment_type,
) {
  const {
    BASEROW_TOKEN,
    BASEROW_CROWDFUNDING_TABLE_ID,
    BASEROW_PAYMENT_RECORDS_TABLE_ID,
  } = env();

  const databaseTableID =
    payment_type === "crowdfunding"
      ? BASEROW_CROWDFUNDING_TABLE_ID
      : payment_type === "ecommerce"
      ? BASEROW_PAYMENT_RECORDS_TABLE_ID
      : null;

  const response = await fetch(
    `https://api.baserow.io/api/database/rows/table/${databaseTableID}/${rowID}/?user_field_names=true`,
    {
      method: "PATCH",
      body: JSON.stringify(updatedData),
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  ).then((res) => res.json());

  console.log({ message: `Baserow record ${rowID} updated`, response });
}
