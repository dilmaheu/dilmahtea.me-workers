// @ts-check

import { reply } from "../../../../utils/createModuleWorker";

export default async function updateProductPrice(itemCode, itemPrice, env) {
  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: "Bearer " + env.CMS_ACCESS_TOKEN,
  });

  // update pricings for all locales
  const productEntries = await fetch(env.CMS_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `
        {
          products(
            locale: "all"
            publicationState: PREVIEW
            filters: { SKU: { eq: "${itemCode}" } }
          ) {
            data {
              id
              attributes {
                Price
              }
            }
          }
        }
      `,
    }),
  })
    .then((res) => res.json())
    .then((response) => response.data.products.data);

  if (
    !(
      productEntries.length > 0 &&
      productEntries[0].attributes.Price !== itemPrice
    )
  ) {
    return reply({ message: "No op!" }, 204);
  } else {
    const mutationQuery = `
      mutation(
        ${productEntries
          .map(
            (_, i) => `
          $id${i}: ID!
          $Price${i}: Float!
        `
          )
          .join("")}
      ) {
          ${productEntries
            .map(
              (_, i) => `
                updateProduct${i}: updateProduct(
                  id: $id${i}
                  data: { Price: $Price${i} }
                ) {
                  data {
                    id
                    attributes {
                      Price
                    }
                  }
                }
              `
            )
            .join("")}
      }
    `;

    // mutation variables (id and Stock_amount)
    const mutationVariables = productEntries.reduce(
      (acc, entry, i) => ({
        ...acc,
        [`id${i}`]: entry.id,
        [`Price${i}`]: itemPrice,
      }),
      {}
    );

    const updatedProductResponse = await fetch(env.CMS_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: mutationQuery,
        variables: mutationVariables,
      }),
    }).then((res) => res.json());

    return reply(
      {
        message: `Product ${itemCode} price updated`,
        response: updatedProductResponse,
      },
      200
    );
  }
}
