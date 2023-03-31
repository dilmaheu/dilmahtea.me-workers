import { ProductsToUpdateType } from "../prod";
import { Env } from "../types";
import { StrapiResponseProduct, StrapiResponseProducts } from "../types/strapi";
import pool from "@ricokahler/pool";
interface ProductInfo {
  id: number;
  SKU: string;
}

export default async function(
  env: Env,
  productIds: ProductInfo[],
  productsQuantity: ProductsToUpdateType[]
) {
  const headers = {
    Authorization: `Bearer ${env.STRAPI_APIKEY}`,
    "content-type": "application/json",
    "User-Agent": "cloudflare-worker",
  };
  /**
   * Uses [pool](https://github.com/ricokahler/pool) to easily limit the amount of concurrent tasks
   */
  const data = await pool({
    collection: productIds,
    maxConcurrency: 2,
    task: async ({ id, SKU }) => {
      const response: Response = await fetch(
        `https://cms.dilmahtea.me/api/products/${id}`,
        {
          headers,
          method: "PUT",
          body: JSON.stringify({
            data: {
              Stock_amount: productsQuantity.find(
                (product) => product.SKU === SKU
              )?.quantity,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const productData: StrapiResponseProduct = await response.json();

      return productData;
    },
  });

  return data;
}
