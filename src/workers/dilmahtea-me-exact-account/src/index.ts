import { ENV } from "./types";

import updateCustomer from "./utils/updateCustomer";
import createCustomer from "./utils/createCustomer";

import { initializeLucia } from "../../../utils/auth";
import fetchExactAPI from "../../../utils/fetchExactAPI";
import getCustomerFilter from "../../../utils/getCustomerFilter";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

declare interface ContactUpdate {
  ProviderId: string;
  contact: string;
  exact_account_guid: string;
  exact_contact_guid: string;
}

declare interface Customer {
  userId?: string;
  Email?: string;
  Phone?: string;
  FirstName: string;
  LastName: string;
  Language: string;
  Address?: {
    [key: string]: string;
    AddressLine1: string;
    City: string;
    Country: string;
    PostCode: string;
  };
}

async function handlePUT(request: Request, env: ENV) {
  const { ProviderId, contact, exact_account_guid, exact_contact_guid } =
    await request.json<ContactUpdate>();

  if (
    request.headers.get("x-cf-secure-worker-token") !==
    env.CF_SECURE_WORKER_TOKEN
  ) {
    return reply({ success: false, error: "Unauthorized" }, 401);
  }

  await Promise.all([
    fetchExactAPI("PUT", "/crm/Accounts(guid'" + exact_account_guid + "')", {
      [ProviderId]: contact,
    }),
    fetchExactAPI("PUT", "/crm/Contacts(guid'" + exact_contact_guid + "')", {
      [ProviderId]: contact,
    }),
  ]);

  return reply({ success: true }, 200);
}

async function handlePOST(request: Request, env: ENV) {
  const { userId, Email, Phone, FirstName, LastName, Language, Address } =
    await request.json<Customer>();

  if (
    request.headers.get("x-cf-secure-worker-token") !==
    env.CF_SECURE_WORKER_TOKEN
  ) {
    return reply({ success: false, error: "Unauthorized" }, 401);
  }

  if (!userId) {
    handlePOST.retry = false;
    handlePOST.catchError = true;
  }

  const Name = `${FirstName} ${LastName}`,
    CustomerData = {
      userId,
      Name,
      Email,
      Phone,
      FirstName,
      LastName,
      Language,
      Address,
    };

  const auth = await initializeLucia(env.USERS);

  const CustomerFilter = getCustomerFilter(Email || Phone, !!Email);

  let Customer = await fetchExactAPI(
    "GET",
    `/CRM/Accounts?$filter=${getCustomerFilter(
      Email || Phone,
      !!Email,
    )}&$select=ID,Name,Language,Email,Phone,Country,LeadSource,Classification1`,
  ).then((Customer) => {
    console.log({
      ExistingCustomer: Customer,
    });

    return Customer.feed.entry?.content["m:properties"];
  });

  if (Customer) {
    console.log("Exact: Customer exists");

    await updateCustomer(auth, CustomerData, Customer, CustomerFilter, userId);
  } else {
    Customer = await createCustomer(CustomerData);

    console.log("Exact: Customer created successfully");
  }

  if (userId) {
    await auth.updateUserAttributes(userId, {
      exact_account_guid: Customer["d:ID"],
      exact_contact_guid: Customer.ContactID,
    });
  }

  return reply({ success: true, Customer }, 200);
}

handlePOST.retry = true;
handlePUT.retry = true;

export default createModuleWorker({
  pathname: "*",
  methods: { POST: handlePOST, PUT: handlePUT },
});
