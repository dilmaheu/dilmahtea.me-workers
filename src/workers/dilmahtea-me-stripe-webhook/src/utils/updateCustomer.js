// @ts-check

import AddressTypes from "./AddressTypes";

async function updateContact(customer, ExistingCustomer, fetchExactAPI) {
  const { Name, Email, FirstName, LastName, Language } = customer;

  const contact = await fetchExactAPI(
    "GET",
    `/CRM/Contacts?$filter=Email eq '${Email}'`
  ).then(({ feed }) => feed.entry.content["m:properties"]);

  const contactID = contact["d:ID"];

  const promises = [];

  if (
    contact["d:FirstName"] !== FirstName ||
    contact["d:LastName"] !== LastName
  ) {
    promises.push(
      fetchExactAPI("PUT", `/CRM/Contacts(guid'${contact["d:ID"]}')`, {
        FirstName,
        LastName,
      }).then(() => console.log("Exact: Contact name updated"))
    );
  }

  const shouldUpdateName = Name !== ExistingCustomer["d:Name"],
    shouldUpdateLanguage = Language !== ExistingCustomer["d:Language"];

  if (
    shouldUpdateName ||
    shouldUpdateLanguage ||
    contactID !== ExistingCustomer["d:MainContact"]
  ) {
    promises.push(
      fetchExactAPI("PUT", `/CRM/Accounts(guid'${ExistingCustomer["d:ID"]}')`, {
        Name,
        Language,
        MainContact: contactID,
      }).then(() => console.log(`Exact: Customer account updated`))
    );
  }

  await Promise.all(promises);
}

async function updateAddress(customer, ExistingCustomer, fetchExactAPI) {
  const { Address } = customer;

  const linkedAddresses = await fetchExactAPI(
    "GET",
    `/CRM/Addresses?$filter=Account eq guid'${ExistingCustomer["d:ID"]}'&$select=ID,Main,Type,City,Country,Postcode,AddressLine1,AddressLine2,AddressLine3`
  ).then(({ feed: { entry } }) => (Array.isArray(entry) ? entry : [entry]));

  await Promise.all(
    Object.values(AddressTypes).map(async (Type) => {
      let matchedAddress;

      const shouldCreateNewAddress = linkedAddresses.every(
        ({ content: { "m:properties": props } }) =>
          props["d:Type"] !== Type ||
          (() => {
            const isCurrentAddress =
              JSON.stringify({ Type, ...Address }) ===
              JSON.stringify({
                Type: props["d:Type"],
                AddressLine1: props["d:AddressLine1"],
                // remove empty string address lines
                AddressLine2: props["d:AddressLine2"] || undefined,
                AddressLine3: props["d:AddressLine3"] || undefined,
                City: props["d:City"],
                Country: props["d:Country"],
                Postcode: props["d:Postcode"],
              });

            if (isCurrentAddress) {
              matchedAddress = props;
            }

            return !isCurrentAddress;
          })()
      );

      if (matchedAddress && !matchedAddress["d:Main"]) {
        await fetchExactAPI(
          "PUT",
          `/CRM/Addresses(guid'${matchedAddress["d:ID"]}')`,
          {
            Main: true,
          }
        );

        console.log("Exact: Address found, set as main");
      }

      if (shouldCreateNewAddress) {
        await fetchExactAPI("POST", "/CRM/Addresses", {
          Type,
          Main: true,
          Account: ExistingCustomer["d:ID"],
          Contact: ExistingCustomer["d:MainContact"],
          ...Address,
        });

        console.log("Exact: New address created");
      }
    })
  );
}

export default async function updateCustomer(
  customer,
  existingCustomer,
  fetchExactAPI
) {
  const ExistingCustomer = existingCustomer.feed.entry.content["m:properties"];

  await Promise.all([
    updateContact(customer, ExistingCustomer, fetchExactAPI),
    updateAddress(customer, ExistingCustomer, fetchExactAPI),
  ]);
}
