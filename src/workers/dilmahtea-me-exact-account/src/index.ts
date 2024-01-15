import { ENV } from "./types";

import updateCustomer from "./utils/updateCustomer";
import createCustomer from "./utils/createCustomer";

import { initializeLucia } from "../../../utils/auth";
import fetchExactAPI from "../../../utils/fetchExactAPI";
import getCustomerFilter from "../../../utils/getCustomerFilter";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

declare interface Body {
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

async function handlePOST(request: Request, env: ENV) {
  const { userId, Email, Phone, FirstName, LastName, Language, Address } =
    await request.json<Body>();

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

  try {
    var Customer = await fetchExactAPI(
      "GET",
      `/CRM/Accounts?$filter=${getCustomerFilter(
        Email || Phone,
        !!Email,
      )}&$select=ID,Name,Language,Email,Phone,Country,LeadSource,Classification1`,
    ).feed.entry;

    if (Customer) {
      console.log("Exact: Customer exists");

      await updateCustomer(
        auth,
        CustomerData,
        Customer,
        CustomerFilter,
        userId,
      );
    } else {
      Customer = await createCustomer(CustomerData);

      console.log("Exact: Customer created successfully");
    }
  } catch (error) {
    if (userId) throw error;

    return reply({ success: false, error: error.message }, 500);
  }

  if (userId) {
    await auth.updateUserAttributes(userId, {
      exact_account_guid: Customer["d:ID"],
    });
  }

  return reply({ success: true, Customer }, 200);
}

handlePOST.retry = true;
handlePOST.SECURE_WORKER_ID = "EXACT_ACCOUNT";

export default createModuleWorker({
  pathname: "*",
  methods: { POST: handlePOST },
});
