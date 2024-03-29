import type { GetDimassStockResponse } from "../types";

import env from "../env";

import hash from "../../../../utils/hash";

import { XMLParser as XMLParserConstructor } from "fast-xml-parser";

const XMLParser = new XMLParserConstructor();

export default async function getStockItems() {
  const body = `
    <soapenv:Envelope
      xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:stoc="https://www.supportplaza.nl/papi/stock"
    >
      <soapenv:Header />
      <soapenv:Body>
        <stoc:getStock> </stoc:getStock>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const nonce = crypto.randomUUID(),
    timestamp = new Date().getTime().toString();

  const signature = await hash(
    nonce + timestamp + env.DIMASS_API_SECRET,
    "SHA-1",
  );

  const headers = {
    nonce,
    timestamp,
    signature,
    apikey: env.DIMASS_API_KEY,
  };

  const dimassStockResponse: GetDimassStockResponse = await fetch(
    env.DIMASS_API_ENDPOINT,
    {
      method: "POST",
      headers,
      body,
    },
  )
    .then((response) => response.text())
    .then((xml) => {
      const response = XMLParser.parse(xml);

      JSON.stringify(response, (_, value) => {
        const fault = value && value["SOAP-ENV:Fault"];

        if (fault) throw new Error(fault.faultstring);

        return value;
      });

      return response;
    });

  const { item } =
    dimassStockResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][
      "ns1:getStockResponse"
    ].return;

  return item;
}
