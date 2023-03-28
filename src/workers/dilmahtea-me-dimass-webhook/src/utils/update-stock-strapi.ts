import { Env, StrapiResponse } from "../types";

export default async function(env: Env) {
  const strapiBaseUrl = "https://cms.dilmahtea.me/api";
  const strapiUrl = `${strapiBaseUrl}/products`;
  const headers = new Headers({
    Accept: "*/*",
    Authorization: `Bearer ${env.STRAPI_APIKEY}`,
    "Content-Type": "application/json",
    "User-Agent": "cloudflare-worker",
  });

  //   const requestOptionsGet = {
  //     method: "GET",
  //     headers,
  //   };

  //   const responseGet = await fetch(strapiUrl, requestOptionsGet);

  //   if (!responseGet.ok) {
  //     throw new Error(`PUT request failed; ${responseGet}`);
  //   }

  // //   const rawResultsGet: StrapiResponse = await responseGet.json();

  const body = {
    data: { Stock_amount: "2" },
  };

  const requestOptionsPUT = {
    method: "PUT",
    body: JSON.stringify(body, null, 2),
    headers,
  };

  const responsePut = await fetch(strapiUrl, requestOptionsPUT);

  if (!responsePut.ok) {
    console.table(responsePut);
    throw new Error(`PUT request failed; ${responsePut}`);
  }
  const rawResultsPut = await responsePut.json();
  const resultsPut = JSON.stringify(rawResultsPut, null, 2);

  return new Response(resultsPut, {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });
}
