// @ts-check

import {
  XMLParser as XMLParserConstructor,
  XMLBuilder as XMLBuilderConstructor,
} from "fast-xml-parser";

import updateBaserowRecord from "./updateBaserowRecord";

const XMLParser = new XMLParserConstructor(),
  XMLBuilder = new XMLBuilderConstructor();

export default async function createOrder(paymentData, env) {
  const {
    data: { countries },
  } = await fetch(env.CMS_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CMS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        {
          countries {
            data {
              attributes {
                name
                code
              }
            }
          }
        }
      `,
    }),
  }).then((response) => response.json());

  const {
    paymentID,
    paymentBaserowRecordID,
    first_name,
    last_name,
    email,
    favorite_tea,
    country,
    city,
    street,
    postal_code,
    kindness_cause,
    shipping_method,
    shipping_cost,
    perk,
    product_name,
    product_desc,
    cart,
    price,
    tax,
    payment_type,
    locale,
    origin_url,
    success_url,
  } = paymentData;

  const countryCode = countries.data.find(
    ({ attributes: { name } }) => name === country
  ).attributes.code;

  const nonce = crypto.randomUUID(),
    timestamp = new Date().getTime().toString();

  const encodedSignature = new TextEncoder().encode(
      nonce + timestamp + env.DIMASS_API_SECRET
    ),
    signatureBuffer = await crypto.subtle.digest("SHA-1", encodedSignature),
    signature = Array.from(new Uint8Array(signatureBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

  const order = {
    orderLines: {
      item: Object.values(cart).map(({ sku, quantity }) => ({
        articleCode: `DILM ${sku}`,
        amount: quantity,
      })),
    },
    partnerCode: "DILM",
    orderNumber: `DILM-${paymentBaserowRecordID}`,
    email,
    deliveryAddress: {
      company: first_name.trim() + " " + last_name.trim(),
      firstname: first_name,
      lastname: last_name,
      street,
      number: "",
      zipcode: postal_code,
      city,
      country: countryCode,
    },
    invoiceAddress: {
      company: first_name.trim() + " " + last_name.trim(),
      firstname: first_name,
      lastname: last_name,
      street,
      number: "",
      zipcode: postal_code,
      city,
      country: countryCode,
    },
  };

  const response = await fetch(env.DIMASS_API_URL, {
    method: "POST",
    headers: {
      nonce,
      timestamp,
      signature,
      apikey: env.DIMASS_API_KEY,
    },
    body: `
      <soapenv:Envelope
        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:ord="https://www.supportplaza.nl/papi/order"
      >
        <soapenv:Header />

        <soapenv:Body>
          <ord:createOrder>
            <order>${XMLBuilder.build(order)}</order>
          </ord:createOrder>
        </soapenv:Body>
      </soapenv:Envelope>
    `,
  })
    .then((response) => response.text())
    .then((xml) => {
      const response = XMLParser.parse(xml);

      JSON.stringify(response, (_, value) => {
        const fault = value && value["SOAP-ENV:Fault"];

        if (fault) throw new Error(fault.faultstring);

        return value;
      });
    })
    .catch(async (error) => {
      await fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: "hello@dilmahtea.me" }],
              dkim_domain: "dilmahtea.me",
              dkim_selector: "mailchannels",
              dkim_private_key: env.DKIM_PRIVATE_KEY,
            },
          ],
          from: {
            email: "hello@dilmahtea.me",
            name: "Dilmah Europe",
          },
          subject: "Error confirming order",
          content: [
            {
              type: "text/plain",
              value: `
                An error happened while confirming an order. Please manually confirm the order.

                Error: ${error.message}
                Payment ID: ${paymentID}
              `
                // just for prettiying the email
                .replace(/\n +/g, "\n")
                .slice(1, -1),
            },
          ],
        }),
      });

      throw error;
    });

  console.log(`Order ${paymentBaserowRecordID} created successfully`, {
    response: response,
  });

  await updateBaserowRecord(
    paymentBaserowRecordID,
    { "Order Status": "Confirmed" },
    payment_type,
    env
  );
}
