import type { ProductsStockInfo } from "../index";

import env from "../env";

interface ProductInfo {
  id: number;
  SKU: string;
  currentStockAmount: number;
}

export default async function updateStrapiProducts(
  strapiProductsData: ProductInfo[],
  productsStockInfo: ProductsStockInfo[],
) {
  const productsData = [];

  strapiProductsData.forEach(({ id, SKU, currentStockAmount }) => {
    const stockInfo = productsStockInfo.find((item) => item.SKU === SKU);

    if (currentStockAmount !== stockInfo.stockAmount) {
      productsData.push({
        id,
        SKU,
        stockAmount: stockInfo.stockAmount,
      });
    }
  });

  if (productsData.length === 0) return;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.STRAPI_ACCESS_TOKEN}`,
  };

  // mutation query for all products
  const mutationQuery = `
    mutation(
      ${productsData
        .map(
          (_, i) => `
        $id${i}: ID!
        $Stock_amount${i}: Int!
      `,
        )
        .join("")}
    ) {
        ${productsData
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
            `,
          )
          .join("")}
    }
  `;

  // mutation variables (id and Stock_amount)
  const mutationVariables = productsData.reduce(
    (acc, product, i) => ({
      ...acc,
      [`id${i}`]: product.id,
      [`Stock_amount${i}`]: product.stockAmount,
    }),
    {},
  );

  await fetch(env.STRAPI_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: mutationQuery,
      variables: mutationVariables,
    }),
  }).then((res) => res.json());

  return Array.from(new Set(productsData.map(({ SKU }) => SKU)));
}
