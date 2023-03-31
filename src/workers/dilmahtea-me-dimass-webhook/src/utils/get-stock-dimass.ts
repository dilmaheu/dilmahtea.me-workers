import { Env } from "../types";
import xml2json from "@hendt/xml2json/lib";
import sha1 from "sha1";
import { GetDimassStockResponse } from "../types/dimass-webhook-get-stock-response";

export default async function(env: Env, orderDate: string) {
  const baseUrl = "https://www.supportplaza.nl";
  const url = `${baseUrl}/papi/stock/1.0`;

  const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:stoc="https://www.supportplaza.nl/papi/stock">
  <soapenv:Header/>
  <soapenv:Body>
     <stoc:getStock>
        <filter>
          <since>${orderDate}</since>
          <item>free</item>
          <item>available</item>
        </filter>
     </stoc:getStock>
  </soapenv:Body>
</soapenv:Envelope>`;

  const nonce = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    .split("")
    .sort(function() {
      return 0.5 - Math.random();
    })
    .join("");

  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = sha1(`${nonce + timestamp + env.DIMASS_SECRET}`);

  const headers = new Headers({
    apikey: env.DIMASS_APIKEY,
    signature: signature.toString(),
    nonce: nonce,
    timestamp: `${timestamp}`,
  });

  const dimassResponse = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!dimassResponse.ok) {
    throw new Error(dimassResponse.statusText);
  }

  const responseBody = await dimassResponse.text();

  if (typeof responseBody !== "string") {
    throw new Error(
      "Something went wrong parsing the response from dimass to text!"
    );
  }

  const json: GetDimassStockResponse = xml2json(responseBody);

  /**
   * NOTE: the 'code' values get mapped to 'SKU' values here.
   */
  const items = [
    ...json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getStockResponse"].return
      .item,
  ]
    .map((item) => ({
      ...item,
      SKU: item.code.split(" ").pop() as string,
    }))
    .filter((item) => item.SKU.length === 13);

  return items;
}
