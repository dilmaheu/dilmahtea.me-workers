import { Main } from "./types";

export interface Env {
  // KV
  CROWDFUNDING_EMAIL: any;
  "__landing-workers_sites_assets_preview": any;
  ECOMMERCE_PAYMENTS: any;
  MAILS: any;
  BASEROW_STATS: any;
  ECOMMERCE_PAYMENTS_DEV: any;
  CROWDFUNDINGS_DEV: any;
  PRODUCTS: any;
  CROWDFUNDINGS: any;
  "landing-THEE": any;
  "landing-THEE_preview": any;
  // `.env` / `.dev.vars`
  DIMASS_APIKEY: string;
  DIMASS_SIGNATURE: string;
  STRAPI_APIKEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = "https://cms.dilmahtea.me/api/products/1";

    if (request.method === "POST") {
      console.table(request);
    }

    if (request.headers) {
      console.log(request.headers);
    }

    const headers = new Headers({
      Accept: "*/*",
      Authorization: `Bearer ${env.STRAPI_APIKEY}`,
      "Content-Type": "application/json",
      "User-Agent": "cloudflare-worker",
    });

    const requestOptionsGet = {
      method: "GET",
      headers,
    };

    const responseGet = await fetch(url, requestOptionsGet);

    if (!responseGet.ok) {
      throw new Error(`PUT request failed; ${responseGet}`);
    }

    const rawResultsGet: Main = await responseGet.json();

    const body = {
      data: { Stock_amount: "2" },
    };

    const requestOptionsPUT = {
      /**
       * Strapi doesn't support PATCH, so I need to fetch the data
       * and the only update the fields I want to update,
       * then send a PUT request to update all the fields.
       */
      method: "PUT",
      body: JSON.stringify(body, null, 2),
      headers,
    };

    const responsePut = await fetch(url, requestOptionsPUT);

    if (!responsePut.ok) {
      console.table(responsePut);
      throw new Error(`PUT request failed; ${responseGet}`);
    }
    const rawResultsPut = await responsePut.json();
    const resultsPut = JSON.stringify(rawResultsPut, null, 2);
    console.log(rawResultsPut);
    return new Response(resultsPut, {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  },
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log(`Hello World!`);
  },
};
