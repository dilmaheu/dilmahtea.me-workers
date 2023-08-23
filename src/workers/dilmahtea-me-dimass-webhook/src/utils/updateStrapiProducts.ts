import { ENV } from "../types";
import { ProductsStockInfo } from "../index";

interface ProductInfo {
  id: number;
  SKU: string;
}

export default async function updateStrapiProducts(
  env: ENV,
  strapiProductsData: ProductInfo[],
  productsStockInfo: ProductsStockInfo[]
) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.STRAPI_ACCESS_TOKEN}`,
  };

  // mutation query for all products
  const mutationQuery = `
    mutation(
      ${strapiProductsData
        .map(
          (_, i) => `
        $id${i}: ID!
        $Stock_amount${i}: Int!
      `
        )
        .join("")}
    ) {
        ${strapiProductsData
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
  const mutationVariables = strapiProductsData.reduce(
    (acc, product, i) => ({
      ...acc,
      [`id${i}`]: product.id,
      [`Stock_amount${i}`]: productsStockInfo.find(
        ({ SKU }) => SKU === product.SKU
      ).stockAmount,
    }),
    {}
  );

  await fetch(env.STRAPI_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: mutationQuery,
      variables: mutationVariables,
    }),
  }).then((res) => res.json());
}
