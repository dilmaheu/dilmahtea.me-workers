import type { ENV } from "../../types";

import { reply } from "../../../../../utils/createModuleWorker";
import fetchExactAPI from "../../../../../utils/fetchExactAPI";

declare interface ContactUpdate {
  ProviderId: string;
  contact: string;
  exact_account_guid: string;
  exact_contact_guid: string;
}

export default async function handlePUT(request: Request, env: ENV) {
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

handlePUT.retry = true;
