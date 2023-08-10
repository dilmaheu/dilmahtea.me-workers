// @ts-check

import AddressTypes from "./AddressTypes";

async function updateContact(customer, contact, fetchExactAPI) {
  const { FirstName, LastName } = customer;

  if (
    contact["d:FirstName"] !== FirstName ||
    contact["d:LastName"] !== LastName
  ) {
    await fetchExactAPI("PUT", `/CRM/Contacts(guid'${contact["d:ID"]}')`, {
      FirstName,
      LastName,
    }).then(() => console.log("Exact: Contact name updated"));
  }
}

async function updateAccount(
  customer,
  ExistingCustomer,
  contact,
  fetchExactAPI
) {
  const contactID = contact["d:ID"],
    { Name, Language } = customer;

  const shouldUpdateName = Name !== ExistingCustomer["d:Name"],
    shouldUpdateLanguage = Language !== ExistingCustomer["d:Language"];

  if (
    shouldUpdateName ||
    shouldUpdateLanguage ||
    contactID !== ExistingCustomer["d:MainContact"]
  ) {
    await fetchExactAPI(
      "PUT",
      `/CRM/Accounts(guid'${ExistingCustomer["d:ID"]}')`,
      {
        Name,
        Language,
        MainContact: contactID,
      }
    ).then(() => console.log(`Exact: Customer account updated`));
  }
}

async function updateAddress(
  customer,
  ExistingCustomer,
  contactID,
  fetchExactAPI
) {
  const { Address } = customer;

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
          Contact: contactID,
          Account: ExistingCustomer["d:ID"],
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

  const promises = [];

  const contact = await fetchExactAPI(
    "GET",
    `/CRM/Contacts?$filter=Email eq '${customer.Email}'&select=ID,FirstName,LastName`
  ).then(async ({ feed }) => {
    let contact;

    // check if there are multiple existing contacts with the same email
    if (Array.isArray(feed.entry)) {
      // check if there is an exact match
      const matchedContact = feed.entry.find(
        ({ content: { "m:properties": props } }) =>
          [customer.FirstName, ExistingCustomer["d:FirstName"]].includes(
            props["d:FirstName"]
          ) &&
          [customer.LastName, ExistingCustomer["d:LastName"]].includes(
            props["d:LastName"]
          )
      );

      if (matchedContact) {
        contact = matchedContact.content["m:properties"];
      } else {
        // create a new contact if there is no exact match
        const newContact = await fetchExactAPI("POST", "/CRM/Contacts", {
          Account: ExistingCustomer["d:ID"],
          FirstName: customer.FirstName,
          LastName: customer.LastName,
          Email: customer.Email,
        });

        return newContact.entry.content["m:properties"];
      }
    } else {
      contact = feed.entry.content["m:properties"];
    }

    promises.push(updateContact(customer, contact, fetchExactAPI));

    return contact;
  });

  const contactID = contact["d:ID"];

  promises.push(
    ...[
      updateAccount(customer, ExistingCustomer, contact, fetchExactAPI),
      updateAddress(customer, ExistingCustomer, contactID, fetchExactAPI),
    ]
  );

  await Promise.all(promises);
}
