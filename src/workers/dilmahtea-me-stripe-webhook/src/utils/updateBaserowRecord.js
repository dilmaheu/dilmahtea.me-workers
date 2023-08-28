// @ts-check

export default async function updateBaserowRecord(
  rowID,
  updatedData,
  payment_type,
  env,
) {
  const databaseTableID =
    payment_type === "crowdfunding"
      ? env.BASEROW_CROWDFUNDING_TABLE_ID
      : payment_type === "ecommerce"
      ? env.BASEROW_PAYMENT_RECORDS_TABLE_ID
      : null;

  const response = await fetch(
    `https://api.baserow.io/api/database/rows/table/${databaseTableID}/${rowID}/?user_field_names=true`,
    {
      method: "PATCH",
      body: JSON.stringify(updatedData),
      headers: {
        Authorization: `Token ${env.BASEROW_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  ).then((res) => res.json());

  console.log({ message: `Baserow record ${rowID} updated`, response });
}
