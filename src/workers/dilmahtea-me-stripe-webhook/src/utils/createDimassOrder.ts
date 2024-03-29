import env from "../env";

import hash from "../../../../utils/hash";

import {
  XMLParser as XMLParserConstructor,
  XMLBuilder as XMLBuilderConstructor,
} from "fast-xml-parser";

const XMLParser = new XMLParserConstructor(),
  XMLBuilder = new XMLBuilderConstructor();

export default async function createDimassOrder({
  paymentBaserowRecordID,
  first_name,
  last_name,
  city,
  street,
  postal_code,
  shipping_cost,
  cart,
  countryCode,
  orderNumber,
}) {
  const nonce = crypto.randomUUID(),
    timestamp = new Date().getTime().toString();

  const signature = await hash(
    nonce + timestamp + env.DIMASS_API_SECRET,
    "SHA-1",
  );

  const order = {
    orderLines: {
      item: Object.values(cart).map(({ sku, price, quantity }) => ({
        articleCode: `DILM ${sku}`,
        amount: quantity,
        unitPrice: Math.round((price / quantity) * 100) / 100,
        vatPercentage: 9,
      })),
    },
    partnerCode: "DILM",
    orderNumber,
    priceIncludingVat: true,
    shippingCost: shipping_cost,
    shippingCostVatPercentage: 9,
    deliveryAddress: {
      // company: first_name.trim() + " " + last_name.trim(),
      firstname: first_name,
      lastname: last_name,
      street,
      number: "",
      zipcode: postal_code,
      city,
      country: countryCode,
    },
    invoiceAddress: {
      // company: first_name.trim() + " " + last_name.trim(),
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

      return response;
    });

  console.log(`Order ${paymentBaserowRecordID} created successfully`, {
    response,
  });
}
