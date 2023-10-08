// @ts-check

import env from "./env";

export default async function updateProductsSingleField(
  ItemsRecord: Record<string, number>,
  Field: string,
  FieldType: string,
): Promise<string> {
  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: ("Bearer " + env.STRAPI_ACCESS_TOKEN) as string,
  });

  // update data for all locales
  const productEntries = await fetch(env.STRAPI_GRAPHQL_ENDPOINT as string, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `
        {
          products(
            locale: "all"
            publicationState: PREVIEW
            filters: { SKU: { in: ${JSON.stringify(
              Object.keys(ItemsRecord),
            )} } }
          ) {
            data {
              id
              attributes {
                SKU
                ${Field}
              }
            }
          }
        }
      `,
    }),
  })
    .then((res) => res.json<any>())
    .then((response) => response.data.products.data)
    .then((entries) =>
      entries.filter(
        (entry) =>
          ItemsRecord[entry.attributes.SKU] !== entry.attributes[Field],
      ),
    );

  if (!(productEntries.length > 0)) {
    return "No op!";
  } else {
    const mutationQuery = `
      mutation(
        ${productEntries
          .map(
            (_, i) => `
          $id${i}: ID!
          $${Field}${i}: ${FieldType}!
        `,
          )
          .join("")}
      ) {
          ${productEntries
            .map(
              (_, i) => `
                updateProduct${i}: updateProduct(
                  id: $id${i}
                  data: { ${Field}: $${Field}${i} }
                ) {
                  data {
                    id
                    attributes {                      
                      ${Field}
                    }
                  }
                }
              `,
            )
            .join("")}
      }
    `;

    const mutationVariables = productEntries.reduce(
      (acc, entry, i) => ({
        ...acc,
        [`id${i}`]: entry.id,
        [`${Field}${i}`]: ItemsRecord[entry.attributes.SKU],
      }),
      {},
    );

    await fetch(env.STRAPI_GRAPHQL_ENDPOINT as string, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: mutationQuery,
        variables: mutationVariables,
      }),
    })
      .then((res) => res.json<any>())
      .then((res) => {
        if (res.errors) {
          throw new Error(JSON.stringify(res.errors, null, 2));
        }
      });

    return "Products updated";
  }
}
