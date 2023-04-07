import { Env } from "../types";
import xml2json from "@hendt/xml2json/lib";
import sha1 from "sha1";
import { GetDimassStockResponse } from "../types";

export default async function(
  env: Env,
  since: boolean,
  orderDateString?: string,
) {
  const url = env.DIMASS_URL;

  const body =
    since && orderDateString
      ? `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:stoc="https://www.supportplaza.nl/papi/stock">
    <soapenv:Header/>
    <soapenv:Body>
       <stoc:getStock>
          <filter>
            <since>${new Date(orderDateString).toISOString()}</since>
            <item>free</item>
            <item>available</item>
          </filter>
       </stoc:getStock>
    </soapenv:Body>
  </soapenv:Envelope>`
      : `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:stoc="https://www.supportplaza.nl/papi/stock">
  <soapenv:Header/>
  <soapenv:Body>
     <stoc:getStock>
       <filter><!--You may enter the following 4 items in any order-->
           <stockTypes>
              <!--Zero or more repetitions:-->
              <item>free</item>
              <item>available</item>
              <item>defect</item>
              <item>return</item>
              <item>blocked</item>
           </stockTypes>
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
  const headers = {
    apikey: env.DIMASS_APIKEY,
    signature: signature.toString(),
    nonce: nonce,
    timestamp: `${timestamp}`,
  };

  const dimassResponse = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!dimassResponse.ok) {
    throw new Error(dimassResponse.statusText);
  }
  // console.log(await dimassResponse.text());
  const responseBody = await dimassResponse.text();

  if (typeof responseBody !== "string") {
    throw new Error(
      "Something went wrong parsing the response from dimass to text!"
    );
  }

  const json: GetDimassStockResponse = xml2json(responseBody);

  /**
   * `item` can be an array of items or just one object 'item'. If the item then does not have an SKU value with 13 characters, ignore this item.
   */
  if (
    Array.isArray(
      json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getStockResponse"].return
        .item
    )
  ) {
    console.log(
      json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getStockResponse"]
    );
    console.log(
      json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getStockResponse"].return
    );
    console.log(
      json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getStockResponse"].return
        ?.item
    );

    const items = [
      ...json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getStockResponse"]
        .return.item,
    ]
      .map((item) => ({
        ...item,
        SKU: item.code.split(" ").pop() as string,
      }))
      .filter((item) => item.SKU.length === 13);

    console.log(items);
    return items;
  }

  const item =
    json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:getStockResponse"].return
      .item;

  /** SKU value without Dimass's 'DIMA' prefix. */
  const itemSku = item.code.split(" ").pop() as string;

  /** If the SKU does not consist of 13 values, don't return the product. These items aren't relevant for strapi* (?)  */
  if (itemSku.length !== 13) {
    return;
  }

  return [
    {
      ...item,
      SKU: itemSku,
    },
  ];
}
