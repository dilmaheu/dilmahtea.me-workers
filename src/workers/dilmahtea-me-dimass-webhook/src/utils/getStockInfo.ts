import type { Item, GetDimassStockResponse } from "../types";

import env from "../env";

import { XMLParser as XMLParserConstructor } from "fast-xml-parser";

const XMLParser = new XMLParserConstructor();

export default async function () {
  const body = `
    <soapenv:Envelope
      xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:stoc="https://www.supportplaza.nl/papi/stock"
    >
      <soapenv:Header />
      <soapenv:Body>
        <stoc:getStock>
          <filter>
            <stockTypes>
              <item>free</item>
              <item>available</item>
              <item>defect</item>
              <item>return</item>
              <item>blocked</item>
            </stockTypes>
          </filter>
        </stoc:getStock>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const nonce = crypto.randomUUID(),
    timestamp = new Date().getTime().toString();

  const encodedSignature = new TextEncoder().encode(
      nonce + timestamp + env.DIMASS_API_SECRET,
    ),
    signatureBuffer = await crypto.subtle.digest("SHA-1", encodedSignature),
    signature = Array.from(new Uint8Array(signatureBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

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
    .then(async (res) => {
      const xml = await res.text();

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      JSON.stringify(xml, (_, value) => {
        const fault = value && value["SOAP-ENV:Fault"];

        if (fault) throw new Error(fault.faultstring);

        return value;
      });

      return xml;
    })
    .then((xml) => XMLParser.parse(xml));

  const { item } =
    dimassStockResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][
      "ns1:getStockResponse"
    ].return;

  const productsStockInfo = ((Array.isArray ? item : [item]) as Item[]).map(
    (item) => ({
      stockAmount: item.availableStock,
      /** SKU value without Dimass's 'DILM' prefix. */
      SKU: item.code.split(" ").pop() as string,
    }),
  );

  return productsStockInfo;
}
