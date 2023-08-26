// @ts-check

export default async function syncProductPrice(ItemsRecord, env) {
  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: "Bearer " + env.STRAPI_ACCESS_TOKEN,
  });

  // update pricings for all locales
  const productEntries = await fetch(env.STRAPI_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `
        {
          products(
            locale: "all"
            publicationState: PREVIEW
            filters: { SKU: { in: ${JSON.stringify(
              Object.keys(ItemsRecord)
            )} } }
          ) {
            data {
              id
              attributes {
                SKU
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

  if (!(productEntries.length > 0)) {
    return "No op!";
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

    const mutationVariables = productEntries.reduce(
      (acc, entry, i) => ({
        ...acc,
        [`id${i}`]: entry.id,
        [`Price${i}`]: ItemsRecord[entry.attributes.SKU],
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
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.errors) {
          throw new Error(JSON.stringify(res.errors, null, 2));
        }
      });

    return "Pricings synced";
  }
}
