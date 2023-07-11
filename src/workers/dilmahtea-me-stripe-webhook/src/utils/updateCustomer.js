// @ts-check

import fetchExactAPIConstructor from "./fetchExactAPIConstructor";

export default async function updateCustomer(
  { Name, FirstName, LastName, Address },
  customer,
  paymentID,
  env
) {
  const fetchExactAPI = fetchExactAPIConstructor(paymentID, env);

  const promises = [];

  const Customer = customer.feed.entry.content["m:properties"];

  const shouldUpdateContact = Name !== Customer["d:Name"];

  if (shouldUpdateContact) {
    promises.push(
      Promise.all([
        fetchExactAPI("PUT", `/CRM/Accounts(guid'${Customer["d:ID"]}')`, {
          Name,
        }),
        fetchExactAPI(
          "PUT",
          `/CRM/Contacts(guid'${Customer["d:MainContact"]}')`,
          {
            FirstName,
            LastName,
          }
        ),
      ]).then(() => console.log("Exact: Customer contact updated"))
    );
  }

  promises.push(
    fetchExactAPI(
      "GET",
      `/CRM/Addresses?$filter=Account eq guid'${Customer["d:ID"]}'&$select=City,Country,Postcode,AddressLine1,AddressLine2,AddressLine3`
    )
      .then(({ feed: { entry } }) => (Array.isArray(entry) ? entry : [entry]))
      .then(async (linkedAddresses) => {
        const shouldCreateNewAddress = linkedAddresses.every(
          ({ content: { "m:properties": props } }) =>
            JSON.stringify(Address) !==
            JSON.stringify({
              AddressLine1: props["d:AddressLine1"],
              // remove empty string address lines
              AddressLine2: props["d:AddressLine2"] || undefined,
              AddressLine3: props["d:AddressLine3"] || undefined,
              City: props["d:City"],
              Country: props["d:Country"],
              Postcode: String(props["d:Postcode"]),
            })
        );

        if (shouldCreateNewAddress) {
          await fetchExactAPI("POST", "/CRM/Addresses", {
            Account: Customer["d:ID"],
            Contact: Customer["d:MainContact"],
            Main: true,
            ...Address,
          });

          console.log("Exact: Customer address created");
        }
      })
  );
}
