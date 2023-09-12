import type { Country } from "../types";

import env from "../env";

export default async function getCountryCode(country) {
  const { STRAPI_ACCESS_TOKEN, STRAPI_GRAPHQL_ENDPOINT } = env();

  const {
    data: { countries },
  } = await fetch(STRAPI_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        {
          countries {
            data {
              attributes {
                name
                code
              }
            }
          }
        }
      `,
    }),
  }).then((response) =>
    response.json<{ data: { countries: { data: Country[] } } }>(),
  );

  const countryCode = countries.data.find(
    ({ attributes: { name } }) => name === country,
  ).attributes.code;

  return countryCode;
}
