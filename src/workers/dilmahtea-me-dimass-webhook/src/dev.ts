import { Env, WebhookResponseData } from "./types";
import getStockDimass from "./utils/get-stock-dimass";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method === "POST") {
      const data = await request.json<WebhookResponseData>();

      const dimassRes = await getStockDimass(env, data.order_date);

      return new Response(JSON.stringify(dimassRes, null, 2), {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    }

    const dimassRes = await getStockDimass(env, "2023-03-26T15:00:21+01:00");

    return new Response(JSON.stringify(dimassRes, null, 2), {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  },
};
