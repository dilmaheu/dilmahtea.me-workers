import { ENV } from "../types";
import { StrapiResponseProducts } from "../types/strapi";

type SKU = string;

export default async function(env: ENV, SKUs: SKU[]) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.STRAPI_APIKEY}`,
  };

  const query = `
    {
      products(
        publicationState: PREVIEW
        filters: { SKU: { in: ${JSON.stringify(SKUs)} } }
      ) {
        data {
          id
          attributes {
            SKU
          }
        }
      }
    }
  `;

  /** get the `id`'s from the products that need to be updated from Strapi */
  const response = await fetch(env.STRAPI_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Strapi: ${response.statusText}`);
  }

  const {
    data: { products },
  }: StrapiResponseProducts = await response.json();

  return products.data.map(({ id, attributes }) => ({
    id,
    SKU: attributes.SKU,
  }));
}
