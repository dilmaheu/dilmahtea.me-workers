import { ProductsToUpdateType } from "../prod";
import { Env } from "../types";
import { StrapiResponseProduct, StrapiResponseProducts } from "../types/strapi";

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
  const responses = await Promise.all(
    productIds.map(async ({ id, SKU }) => {
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

      return response;
    })
  );

  // parse the data from the responses and return this; maybe not necessary
  const data: StrapiResponseProduct[] = await Promise.all(
    responses.map(async (response) => {
      const productData: StrapiResponseProduct = await response.json();
      return productData;
    })
  );

  return data;
}
