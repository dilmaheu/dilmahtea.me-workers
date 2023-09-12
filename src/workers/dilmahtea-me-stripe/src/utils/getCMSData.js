export default async function getCMSData(origin_url, env) {
  const { hostname, origin } = new URL(origin_url);

  const validationDatasetURL =
    hostname === "localhost"
      ? env.ALTERNATIVE_ORIGIN
      : origin + "/db/validation-dataset.json";

  const CMSData = await fetch(validationDatasetURL).then((res) => res.json());

  return CMSData;
}
