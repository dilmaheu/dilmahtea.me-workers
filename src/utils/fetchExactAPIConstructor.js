// @ts-check

import { XMLParser as XMLParserConstructor } from "fast-xml-parser";

const XMLParser = new XMLParserConstructor();

export default function fetchExactAPIConstructor(env) {
  const fetchExactAPI = async (method, url, data) =>
    fetch(url.startsWith("https://") ? url : env.EXACT_API_ENDPOINT + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await env.EXACT_TOKENS.get("ACCESS_TOKEN")}`,
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        console.log(
          `RateLimit-Remaining: ${res.headers.get("x-ratelimit-remaining")}`
        );

        return res.text();
      })
      .then((xml) => {
        const response = XMLParser.parse(xml);

        JSON.stringify(response, (_, value) => {
          const error = value && (value["error"] || value["d:Errors"]);

          if (error) throw new Error(error.message);

          return value;
        });

        return response;
      });

  return fetchExactAPI;
}
