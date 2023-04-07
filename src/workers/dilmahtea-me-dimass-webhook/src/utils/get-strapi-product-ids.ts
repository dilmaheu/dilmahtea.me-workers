import QueryString from "qs";
import { Env } from "../types";
import { StrapiResponseProducts } from "../types/strapi";

type Sku = string;
export default async function(env: Env, skus: Sku[]) {
  const headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${env.STRAPI_APIKEY}`,
    "User-Agent": "cloudflare-worker",
  };

  /** query params for Strapi REST API endpoint */
  const query = QueryString.stringify({
    filters: {
      SKU: {
        $in: skus,
      },
    },
    publicationState: "preview",
  });
  const url = `${env.STRAPI_URL}/products?${query}`;

  /** get the `id`'s from the products that need to be updated from Strapi */
  const idsFromStrapiResponse = await fetch(url, {
    method: "GET",
    headers,
  });

  console.log(JSON.stringify({ idsFromStrapiResponse }, null, 2));

  if (!idsFromStrapiResponse.ok) {
    throw new Error(idsFromStrapiResponse.statusText);
  }

  const idsFromStrapiData: StrapiResponseProducts = await idsFromStrapiResponse.json();

  return idsFromStrapiData;
}
