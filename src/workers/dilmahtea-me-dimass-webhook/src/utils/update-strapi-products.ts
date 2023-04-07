import { ProductsToUpdateType } from "../prod";
import { Env } from "../types";
import { StrapiResponseProduct } from "../types/strapi";
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

  console.log(productIds);
  console.log(productsQuantity);
  
  const data = await Promise.all(
    productIds.map(async ({ id, SKU }) => {
      const newQuantity = productsQuantity.find(
        (product) => product.SKU === SKU
      )?.quantity;

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

      console.log(
        `UPDATED: id: ${id},  sku: ${SKU}, with quantity ${newQuantity}`
      );

      if (!response.ok) {
        console.error(
          `NOT UPDATED: id: ${id},  sku: ${SKU}, with quantity ${newQuantity}`
        );

        return { error: response.statusText };
      }

      const productData: StrapiResponseProduct = await response.json();

      console.log(`no log?`);
      return productData;
    })
  );

  console.log("data", data);
  return data;
}
