// @ts-check

import AddressTypes from "./AddressTypes";

async function updateContact(
  customer,
  ExistingCustomer,
  contact,
  fetchExactAPI
) {
  const contactID = contact["d:ID"],
    { Name, FirstName, LastName, Language } = customer;

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

async function updateAddress(
  customer,
  ExistingCustomer,
  contact,
  fetchExactAPI
) {
  const { Address } = customer,
    contactID = contact["d:ID"];

  const linkedAddresses = await fetchExactAPI(
    "GET",
    `/CRM/Addresses?$filter=Account eq guid'${ExistingCustomer["d:ID"]}'&$select=ID,Main,Contact,Type,City,Country,Postcode,AddressLine1,AddressLine2,AddressLine3`
  ).then(({ feed: { entry } }) => (Array.isArray(entry) ? entry : [entry]));

  await Promise.all(
    Object.values(AddressTypes).map(async (Type) => {
      let matchedAddress;

      const shouldCreateNewAddress = linkedAddresses.every(
        ({ content: { "m:properties": props } }) =>
          props["d:Type"] !== Type ||
          (() => {
            const isCurrentAddress =
              Type === props["d:Type"] &&
              Address.AddressLine1 === props["d:AddressLine1"] &&
              // handle empty string address lines
              Address.AddressLine2 === (props["d:AddressLine2"] || undefined) &&
              Address.AddressLine3 === (props["d:AddressLine3"] || undefined) &&
              Address.City === props["d:City"] &&
              Address.Country === props["d:Country"] &&
              Address.Postcode === props["d:Postcode"];

            if (isCurrentAddress) {
              matchedAddress = props;
            }

            return !isCurrentAddress;
          })()
      );

      if (
        matchedAddress &&
        (!matchedAddress["d:Main"] || matchedAddress["d:Contact"] !== contactID)
      ) {
        await fetchExactAPI(
          "PUT",
          `/CRM/Addresses(guid'${matchedAddress["d:ID"]}')`,
          {
            Main: true,
            Contact: contactID,
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

  const contact = await fetchExactAPI(
    "GET",
    `/CRM/Contacts?$filter=Email eq '${customer.Email}'`
  ).then(({ feed }) => feed.entry.content["m:properties"]);

  await Promise.all([
    updateContact(customer, ExistingCustomer, contact, fetchExactAPI),
    updateAddress(customer, ExistingCustomer, contact, fetchExactAPI),
  ]);
}
