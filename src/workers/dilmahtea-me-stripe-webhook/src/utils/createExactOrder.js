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

  const Name = `${FirstName} ${LastName}`;

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

  let customerID;

  const existingCustomer = await fetchExactAPI(
    "GET",
    `/CRM/Accounts?$filter=Email eq '${Email}'&$select=ID,Name,MainContact`
  );

  const customerExists = !!existingCustomer.feed.entry;

  if (customerExists) {
    console.log("Exact: Customer exists");

    customerID = existingCustomer.feed.entry.content["m:properties"]["d:ID"];

    await updateCustomer(
      { Name, FirstName, LastName, Address },
      existingCustomer,
      fetchExactAPI
    );
  } else {
    customerID = await createCustomer(
      { locale, Name, Email, FirstName, LastName, Address },
      fetchExactAPI
    );

    console.log("Exact: Customer created successfully");
  }

  const salesOrder = await fetchExactAPI("POST", "/salesorder/SalesOrders", {
    OrderedBy: customerID,
    Description: `Sales to ${Name}`,
    SalesOrderLines: await Promise.all(
      Object.values(cart).map(async ({ sku, quantity, price }) => {
        const item = await fetchExactAPI(
          "GET",
          `/logistics/Items?$filter=Code eq '${sku}'&$select=ID`
        );

        return {
          Item: item.feed.entry.content["m:properties"]["d:ID"],
          Quantity: quantity,
          AmountFC: price,
        };
      })
    ),
  });

  console.log("Exact: Sales order created successfully");

  return salesOrder;
}
