import QueryString from "qs";
import { ENV } from "../types";
import { StrapiResponseProducts } from "../types/strapi";

type SKU = string;

export default async function(env: ENV, skus: SKU[]) {
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

  const url = `${env.STRAPI_API_ENDPOINT}/products?${query}`;

  /** get the `id`'s from the products that need to be updated from Strapi */
  const idsFromStrapiResponse = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!idsFromStrapiResponse.ok) {
    throw new Error(`Strapi: ${idsFromStrapiResponse.statusText}`);
  }

  const idsFromStrapiData: StrapiResponseProducts = await idsFromStrapiResponse.json();

  return idsFromStrapiData;
}
