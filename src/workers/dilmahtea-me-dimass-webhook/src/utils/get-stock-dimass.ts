import { Env } from "../types";
import xml2json from "@hendt/xml2json/lib";
import sha1 from "sha1";
import { GetDimassStockResponse } from "../types/dimass-webhook-get-stock-response";

export default async function(env: Env, orderDate: string) {
  const dimassBaseUrl = "https://www.supportplaza.nl";
  const dimassUrl = `${dimassBaseUrl}/papi/stock/1.0`;

  const dimassBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:stoc="https://www.supportplaza.nl/papi/stock">
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

  const dimassNonce = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    .split("")
    .sort(function() {
      return 0.5 - Math.random();
    })
    .join("");

  const dimassTmestamp = Math.round(new Date().getTime() / 1000);

  const dimassSignature = sha1(
    `${dimassNonce + dimassTmestamp + env.DIMASS_SECRET}`
  );

  const dimassHeaders = new Headers({
    apikey: env.DIMASS_APIKEY,
    signature: dimassSignature.toString(),
    nonce: dimassNonce,
    timestamp: `${dimassTmestamp}`,
  });

  const dimassResponse = await fetch(dimassUrl, {
    headers: dimassHeaders,
    method: "POST",
    body: dimassBody,
  });

  const dimassResponseBody = await dimassResponse.text();
  const json: GetDimassStockResponse = xml2json(dimassResponseBody);

  /**
   * NOTE: the 'code' values get mapped to 'SKU' values here.
   */
  const items = [
    ...json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getStockResponse"].return
      .item,
  ].map((item) => ({
    ...item,
    SKU: item.code.split(" ").pop(),
  }));

  return items;
}
