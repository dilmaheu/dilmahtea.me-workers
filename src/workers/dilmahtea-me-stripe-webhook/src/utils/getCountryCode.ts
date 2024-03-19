import type { Country } from "../types";

import D1Strapi from "../../../../utils/D1Strapi";

export default async function getCountryCode(country) {
  const { countries } = await D1Strapi();

  const countryCode = (countries.data as Country[]).find(
    ({ attributes: { name } }) => name === country,
  ).attributes.code;

  return countryCode;
}
