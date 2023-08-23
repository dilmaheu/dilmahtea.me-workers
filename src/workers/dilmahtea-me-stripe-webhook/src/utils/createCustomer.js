// @ts-check

import AddressTypes from "./AddressTypes";

const NonVisitAddressTypes = structuredClone(AddressTypes);

// @ts-ignore
delete NonVisitAddressTypes.Visit;

export default async function createCustomer(
  { Name, Email, FirstName, LastName, Language, Address },
  fetchExactAPI,
) {
  const customer = await fetchExactAPI("POST", "/CRM/Accounts", {
    Name,
    Email,
    Language,
    Status: "C",
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

  // link Visit Address created during Customer creation to the created Contact
  await fetchExactAPI(
    "GET",
    `/CRM/Addresses?$filter=Account eq guid'${customerID}'&$select=ID`,
  )
    .then(({ feed }) => feed.entry.content["m:properties"]["d:ID"])
    .then((addressID) =>
      fetchExactAPI("PUT", `/CRM/Addresses(guid'${addressID}')`, {
        Contact: contactID,
      }),
    );

  // create new Invoice & Delivery Addresses
  await Promise.all(
    Object.values(NonVisitAddressTypes).map((Type) =>
      fetchExactAPI("POST", "/CRM/Addresses", {
        Type,
        Main: true,
        Contact: contactID,
        Account: customerID,
        ...Address,
      }),
    ),
  );

  return customerID;
}
