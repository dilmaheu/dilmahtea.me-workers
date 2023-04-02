import createModuleWorker, {
  reply,
  HTTPMethodHandler,
} from "../../../utils/createModuleWorker";

declare interface ENV {
  BASEROW_TOKEN: string;
  BASEROW_API_URL: string;
  CLOUDFLARE_PAGES_DEPLOY_HOOK: string;
  BASEROW_STATS: KVNamespace;
}

type POSTRequestBody = {
  [key: string]: any;
  table_id: number;
  event_type: string;
};

type BaserowResponseBody = {
  [key: string]: any;
  results: {
    [key: string]: any;
    "Payment Status": string;
    "Amount Paid": string;
  }[];
};

const handleGET: HTTPMethodHandler<ENV> = async (request, env) => {
  const [supportersCount, totalAmountRaised] = await Promise.all([
    env.BASEROW_STATS.get("Number of Supporters"),
    env.BASEROW_STATS.get("Total Amount Raised"),
  ]);

  return reply(JSON.stringify({ supportersCount, totalAmountRaised }), 200);
};

const handlePOST: HTTPMethodHandler<ENV> = async (request, env) => {
  const { table_id, event_type } = await request.json<POSTRequestBody>();

  if (
    table_id === 67746 &&
    ["rows.created", "rows.updated", "rows.deleted"].includes(event_type)
  ) {
    const { results: payments } = await fetch(
      `${env.BASEROW_API_URL}?user_field_names=true&size=0&include=Amount+Paid,Payment+Status`,
      {
        headers: {
          Authorization: `Token ${env.BASEROW_TOKEN}`,
        },
      }
    ).then((res) => res.json<BaserowResponseBody>());

    const paidPayments = payments
      .filter((row) => row["Payment Status"] === "paid")
      .map((row) => parseInt(row["Amount Paid"]));

    const supportersCount = paidPayments.length,
      totalAmountRaised = paidPayments.reduce((a, b) => a + b, 0);

    await Promise.all([
      env.BASEROW_STATS.put("Number of Supporters", String(supportersCount)),
      env.BASEROW_STATS.put("Total Amount Raised", String(totalAmountRaised)),
    ]);

    // trigger a rebuild of the website to update the stats
    await fetch(env.CLOUDFLARE_PAGES_DEPLOY_HOOK, { method: "POST" });

    return reply(
      JSON.stringify({ message: "BASEROW_STATS KV Namespace Updated" }),
      200
    );
  }

  return reply(JSON.stringify({ error: "Bad Request" }), 400);
};

export default createModuleWorker<ENV>({
  pathname: "/",
  methods: { GET: handleGET, POST: handlePOST },
});
