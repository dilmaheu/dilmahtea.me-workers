// @ts-check

export default async function getCountryCode(country, env) {
  const {
    data: { countries },
  } = await fetch(env.CMS_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CMS_ACCESS_TOKEN}`,
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
  }).then((response) => response.json());

  const countryCode = countries.data.find(
    ({ attributes: { name } }) => name === country
  ).attributes.code;

  return countryCode;
}
