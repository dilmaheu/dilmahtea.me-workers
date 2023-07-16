// @ts-check

import AddressTypes from "./AddressTypes";

export default async function createCustomer(
  { locale, Name, Email, FirstName, LastName, Address },
  fetchExactAPI
) {
  const customer = await fetchExactAPI("POST", "/CRM/Accounts", {
    Name,
    Email,
    Status: "C",
    Language: locale.toUpperCase(),
    ...Address,
  });

  const customerID = customer.entry.content["m:properties"]["d:ID"];

  const customerContact = await fetchExactAPI("POST", "/CRM/Contacts", {
    Account: customerID,
    FirstName,
    LastName,
    Email,
  });

  const contactID = customerContact.entry.content["m:properties"]["d:ID"];

  await Promise.all(
    Object.values(AddressTypes).map((Type) =>
      Type === 1
        ? // link Visit Address created during Customer creation to the created Contact
          fetchExactAPI(
            "GET",
            `/CRM/Addresses?$filter=Account eq guid'${customerID}'&$select=ID`
          )
            .then(({ feed }) => feed.entry.content["m:properties"]["d:ID"])
            .then((addressID) =>
              fetchExactAPI("PUT", `/CRM/Addresses(guid'${addressID}')`, {
                Contact: contactID,
              })
            )
        : // create new Invoice & Delivery Addresses
          fetchExactAPI("POST", "/CRM/Addresses", {
            Type,
            Main: true,
            Contact: contactID,
            Account: customerID,
            ...Address,
          })
    )
  );

  return customerID;
}
