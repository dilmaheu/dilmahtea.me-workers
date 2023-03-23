// const headers = new Headers({
//   "Content-Type": "application/json",
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "*",
//   "Access-Control-Allow-Methods": "OPTIONS, POST",
//   "Access-Control-Max-Age": "-1",
// });
// const dimasHeaders = new Headers({
//   Accept: "*/*",
//   apikey: env.DIMASS_APIKEY,
//   signature: env.DIMASS_SIGNATURE,
//   nonce: generateNonce(9),
//   timestamp: new Date().toISOString(),
// });
// const res = await fetch("https://uat.supportplaza.nl/papi/stock/1.0", {
//   method: "POST",
//   headers: dimasHeaders,
//   body: "",
// });

import { Env, WebhookResponseData } from "./types";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // SETUP
    // 1, 4, 7, 8, 128 are valid `product id`'s
    // const url = "https://cms.dilmahtea.me/api/products/1";

    // if (request.method === "POST") {
    //   return new Response(JSON.stringify(await request.json(), null, 2), {
    //     headers: {
    //       "content-type": "application/json;charset=UTF-8",
    //     },
    //   });
    // }

    if (request.method === "POST") {
      const data = await request.json<WebhookResponseData>();
      console.table(data);

      await env.DIMASS_WEBHOOK_RESPONSES.put(
        `${new Date().getTime()}`,
        JSON.stringify(
          {
            data,
            signature: request.headers.get("X-SP-Signature"),
            event: request.headers.get("X-SP-Event"),
            timestamp: request.headers.get("X-SP-Timestamp"),
          },
          null,
          2
        )
      );

      return new Response(JSON.stringify(data, null, 2), {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    }
    
    return new Response(
      JSON.stringify({ message: "No POST request received." }, null, 2),
      {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      }
    );
    // const headers = new Headers({
    //   Accept: "*/*",
    //   Authorization: `Bearer ${env.STRAPI_APIKEY}`,
    //   "Content-Type": "application/json",
    //   "User-Agent": "cloudflare-worker",
    // });

    // const requestOptionsGet = {
    //   method: "GET",
    //   headers,
    // };

    // const responseGet = await fetch(url, requestOptionsGet);

    // if (!responseGet.ok) {
    //   throw new Error(`PUT request failed; ${responseGet}`);
    // }

    // const rawResultsGet: Main = await responseGet.json();

    // const body = {
    //   data: { Stock_amount: "2" },
    // };

    // const requestOptionsPUT = {
    //   /**
    //    * Strapi doesn't support PATCH, so I need to fetch the data
    //    * and the only update the fields I want to update,
    //    * then send a PUT request to update all the fields.
    //    */
    //   method: "PUT",
    //   body: JSON.stringify(body, null, 2),
    //   headers,
    // };

    // const responsePut = await fetch(url, requestOptionsPUT);

    // if (!responsePut.ok) {
    //   console.table(responsePut);
    //   throw new Error(`PUT request failed; ${responseGet}`);
    // }
    // const rawResultsPut = await responsePut.json();
    // const resultsPut = JSON.stringify(rawResultsPut, null, 2);
    // console.log(rawResultsPut);
    // return new Response(resultsPut, {
    //   headers: {
    //     "content-type": "application/json;charset=UTF-8",
    //   },
    // });
  },
};
