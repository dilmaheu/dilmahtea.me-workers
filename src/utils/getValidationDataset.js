// @ts-check

import { z } from "zod";

export default async function getValidationDataset(origin_url, env) {
  const isDevelopment = !!env.CF_PAGES_DOMAIN;

  const originURL = new URL(origin_url);

  const origin =
    isDevelopment && originURL.hostname === "localhost"
      ? env.ORIGIN
      : originURL.origin;

  const OriginSchema = z
    .string()
    .regex(
      new RegExp(
        "^" + (env.CF_PAGES_DOMAIN?.replace("*", "[^.]+") || env.ORIGIN) + "$",
      ),
    );

  if (!OriginSchema.safeParse(origin).success) {
    throw new Error("Invalid origin");
  }

  const validationDatasetURL = origin + "/db/validation-dataset.json";

  const dataset = await fetch(validationDatasetURL).then((res) => res.json());

  return dataset;
}
