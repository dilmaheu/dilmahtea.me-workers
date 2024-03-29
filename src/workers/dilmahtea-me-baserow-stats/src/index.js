import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function handleGET(_, env) {
  const [supportersCount, totalAmountRaised] = await Promise.all([
    env.BASEROW_STATS.get("Number of Supporters"),
    env.BASEROW_STATS.get("Total Amount Raised"),
  ]);

  return reply({ supportersCount, totalAmountRaised }, 200);
}

async function handlePOST(request, env) {
  const { table_id, event_type } = await request.json();

  if (
    request.headers.get("Webhook-Secret") === env.BASEROW_WEBHOOK_SECRET &&
    `${table_id}` === env.BASEROW_CROWDFUNDING_TABLE_ID &&
    ["rows.created", "rows.updated", "rows.deleted"].includes(event_type)
  ) {
    const { results: payments } = await fetch(
      `https://api.baserow.io/api/database/rows/table/${env.BASEROW_CROWDFUNDING_TABLE_ID}/?user_field_names=true&size=0&include=Amount+Paid,Payment+Status`,
      {
        headers: {
          Authorization: `Token ${env.BASEROW_TOKEN}`,
        },
      },
    ).then((res) => res.json());

    const paidPayments = payments
      .filter((row) => row["Payment Status"] === "paid")
      .map((row) => parseInt(row["Amount Paid"]));

    const supportersCount = paidPayments.length,
      totalAmountRaised = paidPayments.reduce((a, b) => a + b, 0);

    await Promise.all([
      env.BASEROW_STATS.put("Number of Supporters", supportersCount),
      env.BASEROW_STATS.put("Total Amount Raised", totalAmountRaised),
    ]);

    // trigger a rebuild of the website to update the stats
    await fetch(env.CLOUDFLARE_PAGES_DEPLOY_HOOK, { method: "POST" });

    return reply({ message: "BASEROW_STATS KV Namespace Updated" }, 200);
  }

  return reply({ error: "Bad Request" }, 400);
}

export default createModuleWorker({
  pathname: "/",
  methods: { GET: handleGET, POST: handlePOST },
});
