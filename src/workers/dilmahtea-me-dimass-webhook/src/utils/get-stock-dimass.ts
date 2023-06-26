import sha1 from "sha1";
import { XMLParser as XMLParserConstructor } from "fast-xml-parser";

import { ENV } from "../types";
import { Item, GetDimassStockResponse } from "../types";

const XMLParser = new XMLParserConstructor();

export default async function(env: ENV) {
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
    timestamp = new Date().getTime().toString(),
    signature = sha1(`${nonce + timestamp + env.DIMASS_SECRET}`);

  const headers = {
    nonce,
    timestamp,
    signature,
    apikey: env.DIMASS_APIKEY,
  };

  const dimassStockResponse: GetDimassStockResponse = await fetch(
    env.DIMASS_API_ENDPOINT,
    {
      method: "POST",
      headers,
      body,
    }
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }

      return res.text();
    })
    .then((xml) => XMLParser.parse(xml));

  const { item } = dimassStockResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][
    "ns1:getStockResponse"
  ].return;

  const productsStockInfo = ((Array.isArray ? item : [item]) as Item[]).map(
    (item) => ({
      stockAmount: item.availableStock,
      /** SKU value without Dimass's 'DILM' prefix. */
      SKU: item.code.split(" ").pop() as string,
    })
  );

  return productsStockInfo;
}
