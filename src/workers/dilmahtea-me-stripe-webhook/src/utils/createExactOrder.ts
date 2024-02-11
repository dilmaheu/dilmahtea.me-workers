import env from "../env";

import fetchExactAPI from "../../../../utils/fetchExactAPI";

export default async function createExactOrder({
  locale,
  email: Email,
  first_name: FirstName,
  last_name: LastName,
  city: City,
  postal_code: Postcode,
  street,
  cart,
  countryCode: Country,
}) {
  const Name = `${FirstName} ${LastName}`,
    Language = locale.toUpperCase();

  // split street into lines of 60 characters
  const addressLines = [],
    words = street.split(" ");

  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    if (currentLine.length + words[i].length + 1 <= 60) {
      currentLine += " " + words[i];
    } else {
      addressLines.push([`AddressLine${addressLines.length + 1}`, currentLine]);

      currentLine = words[i];
    }
  }

  // push the last line to the array
  addressLines.push([`AddressLine${addressLines.length + 1}`, currentLine]);

  const Address = {
    ...Object.fromEntries(addressLines),
    City,
    Country, // TODO: Map country name to country code
    Postcode,
  };

  const CustomerData = { Name, Email, FirstName, LastName, Language, Address };

  const { success, error, Customer } = await env.EXACT_ACCOUNT.fetch(
    env.EXACT_ACCOUNT_WORKER_URL,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-cf-secure-worker-token": env.CF_SECURE_WORKER_TOKEN,
      },
      body: JSON.stringify(CustomerData),
    },
  ).then((res) => res.json<any>());

  if (!success) {
    throw new Error(error);
  }

  // add shipping cost to cart
  const cartWithShippingCost = {
    ...cart,
    "SHP-WEBSHOP": {
      sku: "SHP-WEBSHOP",
      quantity: 1,
      price: 4.5,
    },
  };

  const SKUsFilterQuery = Object.values(cartWithShippingCost)
    .map(({ sku }) => `Code eq '${sku}'`)
    .join(" or ");

  const items = await fetchExactAPI(
    "GET",
    `/logistics/Items?$filter=${SKUsFilterQuery}&$select=ID,Code`,
  ).then(({ feed }) =>
    feed.entry.map(({ content }) => content["m:properties"]),
  );

  const salesOrder = await fetchExactAPI("POST", "/salesorder/SalesOrders", {
    OrderedBy: Customer["d:ID"],
    Description: `Sales to ${Name}`,
    PaymentCondition: env.PAYMENT_CONDITION,
    SalesOrderLines: Object.values(cartWithShippingCost).map(
      ({ sku, quantity, price, tax }) => ({
        Item: items.find((props) => props["d:Code"] === sku)["d:ID"],
        Quantity: quantity,
        NetPrice: !tax
          ? price
          : Math.round(((price - tax) / quantity) * 100) / 100,
      }),
    ),
  });

  console.log("Exact: Sales order created successfully");

  return salesOrder;
}
