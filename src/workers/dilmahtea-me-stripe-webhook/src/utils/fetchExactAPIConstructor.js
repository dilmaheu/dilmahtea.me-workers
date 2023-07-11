// @ts-check

import sendErrorEmail from "./sendErrorEmail";
import { XMLParser as XMLParserConstructor } from "fast-xml-parser";

const XMLParser = new XMLParserConstructor();

export default function fetchExactAPIConstructor(paymentID, env) {
  const fetchExactAPI = async (method, url, data) =>
    fetch(env.EXACT_API_ENDPOINT + url, {
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
          const error = value && value["error"];

          if (error) throw new Error(error.message);

          return value;
        });

        return response;
      })
      .catch((error) => sendErrorEmail(error, "Exact", paymentID, env));

  return fetchExactAPI;
}
