// @ts-check

import AddressTypes from "./AddressTypes";

export default async function updateCustomer(
  { Name, FirstName, LastName, Language, Address },
  customer,
  fetchExactAPI
) {
  const promises = [];

  const Customer = customer.feed.entry.content["m:properties"];

  const shouldUpdateContact = Name !== Customer["d:Name"],
    shouldUpdateLanguage = Language !== Customer["d:Language"];

  if (shouldUpdateContact) {
    promises.push(
      fetchExactAPI(
        "PUT",
        `/CRM/Contacts(guid'${Customer["d:MainContact"]}')`,
        {
          FirstName,
          LastName,
        }
      ).then(() => console.log("Exact: Customer contact updated"))
    );
  }

  if (shouldUpdateContact || shouldUpdateLanguage) {
    promises.push(
      fetchExactAPI("PUT", `/CRM/Accounts(guid'${Customer["d:ID"]}')`, {
        Name,
        Language,
      }).then(() =>
        console.log(
          `Exact: Customer ${
            shouldUpdateContact || shouldUpdateLanguage
              ? "name & language"
              : shouldUpdateContact
              ? "name"
              : "language"
          } updated`
        )
      )
    );
  }

  promises.push(
    fetchExactAPI(
      "GET",
      `/CRM/Addresses?$filter=Account eq guid'${Customer["d:ID"]}'&$select=ID,Main,Type,City,Country,Postcode,AddressLine1,AddressLine2,AddressLine3`
    )
      .then(({ feed: { entry } }) => (Array.isArray(entry) ? entry : [entry]))
      .then(async (linkedAddresses) =>
        Promise.all(
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
            }

            if (shouldCreateNewAddress) {
              await fetchExactAPI("POST", "/CRM/Addresses", {
                Type,
                Main: true,
                Account: Customer["d:ID"],
                Contact: Customer["d:MainContact"],
                ...Address,
              });
            }
          })
        )
      )
  );
}
