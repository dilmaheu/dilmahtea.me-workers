// @ts-check

import createCustomer from "./createCustomer";
import updateCustomer from "./updateCustomer";
import fetchExactAPIConstructor from "../../../../utils/fetchExactAPIConstructor";

export default async function createExactOrder(
  {
    locale,
    email: Email,
    first_name: FirstName,
    last_name: LastName,
    city: City,
    postal_code: Postcode,
    street,
    cart,
    countryCode: Country,
  },
  env
) {
  const fetchExactAPI = fetchExactAPIConstructor(env);

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

  const Customer = { Name, Email, FirstName, LastName, Language, Address };

  let customerID;

  const existingCustomer = await fetchExactAPI(
    "GET",
    `/CRM/Accounts?$filter=Email eq '${Email}'&$select=ID,Name,Language,MainContact`
  );

  const customerExists = !!existingCustomer.feed.entry;

  if (customerExists) {
    console.log("Exact: Customer exists");

    customerID = existingCustomer.feed.entry.content["m:properties"]["d:ID"];

    await updateCustomer(Customer, existingCustomer, fetchExactAPI);
  } else {
    customerID = await createCustomer(Customer, fetchExactAPI);

    console.log("Exact: Customer created successfully");
  }

  // add shipping cost to cart
  cart["SHP-WEBSHOP"] = {
    sku: "SHP-WEBSHOP",
    quantity: 1,
    price: 4.5,
  };

  const SKUsFilterQuery = Object.values(cart)
    .map(({ sku }) => `Code eq '${sku}'`)
    .join(" or ");

  const items = await fetchExactAPI(
    "GET",
    `/logistics/Items?$filter=${SKUsFilterQuery}&$select=ID,Code`
  ).then(({ feed }) =>
    feed.entry.map(({ content }) => content["m:properties"])
  );

  const salesOrder = await fetchExactAPI("POST", "/salesorder/SalesOrders", {
    OrderedBy: customerID,
    Description: `Sales to ${Name}`,
    PaymentCondition: env.PAYMENT_CONDITION,
    SalesOrderLines: Object.values(cart).map(
      ({ sku, quantity, price, tax }) => ({
        Item: items.find((props) => props["d:Code"] === sku)["d:ID"],
        Quantity: quantity,
        NetPrice: !tax
          ? price
          : Math.round((price / quantity - tax / quantity) * 100) / 100,
      })
    ),
  });

  console.log("Exact: Sales order created successfully");

  return salesOrder;
}
