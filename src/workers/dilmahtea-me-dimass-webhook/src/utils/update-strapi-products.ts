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

  // mutation query for all products
  const mutationQuery = `
    mutation(
      ${productIds
        .map(
          (_, i) => `
        $id${i}: ID!
        $Stock_amount${i}: Long!
      `
        )
        .join("")}
    ) {
        ${productIds
          .map(
            (_, i) => `
              updateProduct${i}: updateProduct(
                id: $id${i}
                data: { Stock_amount: $Stock_amount${i} }
              ) {
                data {
                  id
                  attributes {
                    Stock_amount
                  }
                }
              }
            `
          )
          .join("")}
    }
  `;

  // mutation variables (id and Stock_amount)
  const mutationVariables = productIds.reduce(
    (acc, product, i) => ({
      ...acc,
      [`id${i}`]: product.id,
      [`Stock_amount${i}`]: Number(
        productsQuantity.find(({ SKU }) => SKU === product.SKU).quantity
      ),
    }),
    {}
  );

  const response = await fetch(env.STRAPI_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: mutationQuery,
      variables: mutationVariables,
    }),
  });

  if (!response.ok) {
    console.error(await response.json());
  }

  console.log("SKUs updated: ", ...productIds.map((product) => product.SKU));
}
