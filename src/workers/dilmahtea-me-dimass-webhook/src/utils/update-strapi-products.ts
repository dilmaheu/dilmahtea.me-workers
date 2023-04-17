import { ENV } from "../types";
import { ProductsToUpdateType } from "../index";

interface ProductInfo {
  id: number;
  SKU: string;
}

export default async function(
  env: ENV,
  productIds: ProductInfo[],
  productsQuantity: ProductsToUpdateType[]
) {
  const headers = {
    Authorization: `Bearer ${env.STRAPI_APIKEY}`,
    "content-type": "application/json",
    "User-Agent": "cloudflare-worker",
  };

  await Promise.all(
    productIds.map(async ({ id, SKU }) => {
      const newQuantity = productsQuantity.find(
        (product) => product.SKU === SKU
      ).quantity;

      const response: Response = await fetch(
        `${env.STRAPI_URL}/products/${id}`,
        {
          headers,
          method: "PUT",
          body: JSON.stringify({
            data: {
              Stock_amount: newQuantity,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error({
          error: response.statusText,
          message: `NOT UPDATED: id: ${id},  sku: ${SKU}, with quantity ${newQuantity}`,
        });
      }

      console.log(
        `UPDATED: id: ${id},  sku: ${SKU}, with quantity ${newQuantity}`
      );
    })
  );
}
