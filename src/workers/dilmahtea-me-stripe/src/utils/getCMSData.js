export default async function getCMSData(request, env) {
  const origin = (() => {
    // check if an alternative origin exists
    if (env.ALTERNATIVE_ORIGIN) {
      const { hostname } = new URL(request.headers.get("referer"));

      if (hostname === "localhost") {
        return env.ALTERNATIVE_ORIGIN;
      }
    } else {
      return request.headers.get("Origin");
    }
  })();

  const validationDatasetURL = origin + "/db/validation-dataset.json";

  const CMSData = await fetch(validationDatasetURL).then((res) => res.json());

  return CMSData;
}
