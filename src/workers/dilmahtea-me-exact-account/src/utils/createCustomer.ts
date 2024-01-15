import env from "../env";
import AddressTypes from "./AddressTypes";
import fetchExactAPI from "../../../../utils/fetchExactAPI";

const NonVisitAddressTypes = structuredClone(AddressTypes);

// @ts-ignore
delete NonVisitAddressTypes.Visit;

export default async function createCustomer({
  Name,
  Email,
  Phone,
  FirstName,
  LastName,
  Language,
  Address = {},
}) {
  const contact = Email || Phone,
    contactType = Email ? "email" : "phone";

  const Customer = await fetchExactAPI("POST", "/CRM/Accounts", {
    [contactType]: contact,
    Name,
    Language,
    Status: "C",
    ...Address,
    LeadSource: await env.EXACT_GUID_COLLECTION.get("WEBSHOP_LEAD_SOURCE"),
    Classification1: await env.EXACT_GUID_COLLECTION.get(
      "B2C_CUSTOMER_SEGMENT",
    ),
  }).entry.content["m:properties"];

  const CustomerID = Customer["d:ID"];

  const Contact = await fetchExactAPI("POST", "/CRM/Contacts", {
    [contactType]: contact,
    Account: CustomerID,
    FirstName,
    LastName,
  });

  const ContactID = Contact.entry.content["m:properties"]["d:ID"];

  if (Object.keys(Address).length) {
    // link Visit Address created during Customer creation to the created Contact
    await fetchExactAPI(
      "GET",
      `/CRM/Addresses?$filter=Account eq guid'${CustomerID}'&$select=ID`,
    )
      .then(({ feed }) => feed.entry.content["m:properties"]["d:ID"])
      .then((addressID) =>
        fetchExactAPI("PUT", `/CRM/Addresses(guid'${addressID}')`, {
          Contact: ContactID,
        }),
      );

    // create new Invoice & Delivery Addresses
    await Promise.all(
      Object.values(NonVisitAddressTypes).map((Type) =>
        fetchExactAPI("POST", "/CRM/Addresses", {
          Type,
          Main: true,
          Contact: ContactID,
          Account: CustomerID,
          ...Address,
        }),
      ),
    );
  }

  return Customer;
}
