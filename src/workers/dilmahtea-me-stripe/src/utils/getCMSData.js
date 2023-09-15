// @ts-check

import { z } from "zod";

export default async function getCMSData(origin_url, env) {
  const originURL = new URL(origin_url);

  const origin =
    originURL.hostname === "localhost" ? env.ORIGIN : originURL.origin;

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

  const CMSData = await fetch(validationDatasetURL).then((res) => res.json());

  return CMSData;
}
