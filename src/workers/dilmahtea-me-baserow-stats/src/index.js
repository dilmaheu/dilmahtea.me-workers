import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function handleGET(request, env) {
  const supportersCount = await env.BASEROW_STATS.get("Number of Supporters"),
    totalAmountRaised = await env.BASEROW_STATS.get("Total Amount Raised");

  return reply(JSON.stringify({ supportersCount, totalAmountRaised }), 200);
}

async function handlePOST(request, env) {
  const { table_id, event_type } = await request.json();

  if (
    table_id === 67746 &&
    [
      "row.created",
      "row.updated",
      "row.deleted",
      "rows.created",
      "rows.updated",
      "rows.deleted",
    ].includes(event_type)
  ) {
    const { results: payments } = await fetch(
      `${env.BASEROW_API_URL}?user_field_names=true&size=0&include=Amount+Paid,Payment+Status`,
      {
        headers: {
          Authorization: `Token ${env.BASEROW_TOKEN}`,
        },
      }
    ).then((res) => res.json());

    const paidPayments = payments.filter(
      (row) => row["Payment Status"] === "paid"
    );

    const supportersCount = paidPayments.length;

    const initialAmount = 0;

    const totalAmountRaised = paidPayments.reduce(
      (total, payment) => total + parseInt(payment["Amount Paid"]),
      initialAmount
    );

    await env.BASEROW_STATS.put("Number of Supporters", supportersCount);
    await env.BASEROW_STATS.put("Total Amount Raised", totalAmountRaised);

    // Trigger a rebuild of the dilmahtea.me website
    await fetch(env.CLOUDFLARE_PAGES_DEPLOY_HOOK, { method: "POST" });

    return reply(
      JSON.stringify({ message: "BASEROW_STATS KV Namespace Updated" }),
      200
    );
  }

  return reply(JSON.stringify({ error: "Bad Request" }), 400);
}

export default createModuleWorker({
  pathname: "/",
  methods: { GET: handleGET, POST: handlePOST },
});
