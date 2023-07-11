// @ts-check

import fetchExactAPIConstructor from "./fetchExactAPIConstructor";

export default async function createCustomer(
  { locale, Name, Email, FirstName, LastName, Address },
  paymentID,
  env
) {
  const fetchExactAPI = fetchExactAPIConstructor(paymentID, env);

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

  const addressEndpoint = await fetchExactAPI(
    "GET",
    `/CRM/Addresses?$filter=Account eq guid'${customerID}'&$select=ID`
  ).then(({ feed }) => feed.entry.id);

  await fetchExactAPI("PUT", addressEndpoint, { Contact: contactID });

  return customerID;
}
