// @ts-check

import env from "../env";
import AddressTypes from "./AddressTypes";

import { initializeLucia } from "../../../../utils/auth";

import formatNumber from "../../../../utils/formatNumber";
import fetchExactAPI from "../../../../utils/fetchExactAPI";
import getCustomerFilter from "../../../../utils/getCustomerFilter";

async function updateAccount(Customer, ExistingCustomer) {
  const WEBSHOP_LEAD_SOURCE = await env.EXACT_GUID_COLLECTION.get(
      "WEBSHOP_LEAD_SOURCE",
    ),
    B2C_CUSTOMER_SEGMENT = await env.EXACT_GUID_COLLECTION.get(
      "B2C_CUSTOMER_SEGMENT",
    );

  const { Name, Language } = Customer;

  let UpdatedUserAttributes: Record<string, string> = {};

  if (ExistingCustomer["d:Language"] !== Language) {
    UpdatedUserAttributes.Language = Language;
  }

  if (
    ExistingCustomer["d:Name"] !== Name &&
    ["", WEBSHOP_LEAD_SOURCE].includes(ExistingCustomer["d:LeadSource"]) &&
    ["", B2C_CUSTOMER_SEGMENT].includes(ExistingCustomer["d:Classification1"])
  ) {
    UpdatedUserAttributes.Name = Name;
  }

  if (!ExistingCustomer["d:Classification1"]) {
    UpdatedUserAttributes.Classification1 = B2C_CUSTOMER_SEGMENT;
  }

  if (Object.keys(UpdatedUserAttributes).length) {
    await fetchExactAPI(
      "PUT",
      `/crm/Accounts(guid'${ExistingCustomer["d:ID"]}')`,
      env,
      UpdatedUserAttributes,
    );

    console.log(`Exact: Customer account updated`);
  }
}

async function updateAddress(Customer, ExistingCustomer, ContactID) {
  const { Address } = Customer;

  const linkedAddresses = await fetchExactAPI(
    "GET",
    `/CRM/Addresses?$filter=Account eq guid'${ExistingCustomer["d:ID"]}'&$select=ID,Main,Contact,Type,City,Country,Postcode,AddressLine1,AddressLine2,AddressLine3`,
  ).then(({ feed: { entry } }) => (Array.isArray(entry) ? entry : [entry]));

  await Promise.all(
    Object.values(AddressTypes).map(async (Type) => {
      let matchedAddress;

      const shouldCreateNewAddress = linkedAddresses.every(
        ({ content: { "m:properties": props } }) =>
          props["d:Type"] !== Type ||
          (() => {
            const isCurrentAddress =
              // === check requires stringifying all props
              Type == props["d:Type"] &&
              Address.AddressLine1 == props["d:AddressLine1"] &&
              Address.AddressLine2 == (props["d:AddressLine2"] || undefined) &&
              Address.AddressLine3 == (props["d:AddressLine3"] || undefined) &&
              Address.City == props["d:City"] &&
              Address.Country == props["d:Country"] &&
              Address.Postcode == props["d:Postcode"];

            if (isCurrentAddress) {
              matchedAddress = props;
            }

            return !isCurrentAddress;
          })(),
      );

      if (
        matchedAddress &&
        (!matchedAddress["d:Main"] || matchedAddress["d:Contact"] !== ContactID)
      ) {
        await fetchExactAPI(
          "PUT",
          `/CRM/Addresses(guid'${matchedAddress["d:ID"]}')`,
          {
            Main: true,
            Contact: ContactID,
          },
        );

        console.log("Exact: Address found, set as main");
      }

      if (shouldCreateNewAddress) {
        await fetchExactAPI("POST", "/CRM/Addresses", {
          Type,
          Main: true,
          Contact: ContactID,
          Account: ExistingCustomer["d:ID"],
          ...Address,
        });

        console.log("Exact: New address created");
      }
    }),
  );
}

export default async function updateCustomer(
  auth,
  Customer,
  ExistingCustomer,
  CustomerFilter,
  userId,
) {
  const { Email, Phone, Name, FirstName, LastName, Address } = Customer;

  const contact = Email || Phone,
    contactIsEmail = !!Email;

  const contactType = contactIsEmail ? "email" : "phone",
    alternateContactType = contactIsEmail ? "phone" : "email";

  const alternateContact = contactIsEmail
    ? ExistingCustomer["d:Phone"] &&
      formatNumber(ExistingCustomer["d:Phone"], ExistingCustomer["d:Country"])
    : ExistingCustomer["d:Email"].toLowerCase();

  if (alternateContact) {
    CustomerFilter +=
      " or " + getCustomerFilter(alternateContact, !contactIsEmail);

    if (userId) {
      await auth.createKey({
        userId,
        providerId: alternateContactType,
        providerUserId: alternateContact,
        password: null,
      });

      await auth.updateUserAttributes(userId, {
        [alternateContactType]: alternateContact,
      });
    }
  }

  const promises = [];

  const Contact = await fetchExactAPI(
    "GET",
    `/CRM/Contacts?$filter=Account eq guid'${ExistingCustomer["d:ID"]}' and (${CustomerFilter})&select=ID,FirstName,LastName,Email,Phone`,
  ).then(async ({ feed }) => {
    const matchedContact = [feed.entry]
      .flat()
      .filter(Boolean)
      .find(({ content: { "m:properties": props } }) => {
        return [Name, ExistingCustomer["d:Name"]].includes(
          props["d:FirstName"] + " " + props["d:LastName"],
        );
      })?.content["m:properties"];

    if (matchedContact) {
      const matchContact = (contact: string, isEmail: boolean): boolean =>
        matchedContact[`d:${isEmail ? "Email" : "Phone"}`] ===
        (isEmail ? contact : String(contact.slice(1)));

      const ContactID = matchedContact["d:ID"];

      if (
        matchedContact["d:FirstName"] !== FirstName ||
        matchedContact["d:LastName"] !== LastName ||
        (alternateContact &&
          (matchContact(contact, contactIsEmail) ||
            matchContact(alternateContact, !contactIsEmail)))
      ) {
        promises.push(
          fetchExactAPI("PUT", `/CRM/Contacts(guid'${ContactID}')`, env, {
            FirstName,
            LastName,
            ...(!alternateContact
              ? {}
              : {
                  [contactType]: contact,
                  [alternateContactType]: alternateContact,
                }),
          }).then(() => console.log(`Exact: Contact updated`)),
        );

        return matchedContact;
      }
    } else {
      // create a new contact if there is no contact or exact match
      const NewContact = await fetchExactAPI("POST", "/CRM/Contacts", {
        Account: ExistingCustomer["d:ID"],
        FirstName,
        LastName,
        [contactType]: contact,
      });

      return NewContact.entry.content["m:properties"];
    }
  });

  promises.push(
    ...[
      updateAccount(Customer, ExistingCustomer),
      Address && updateAddress(Customer, ExistingCustomer, Contact["d:ID"]),
    ],
  );

  await Promise.all(promises);
}
