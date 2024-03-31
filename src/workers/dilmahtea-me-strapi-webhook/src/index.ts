import type { ENV } from "./types";

import updateD1DB from "./utils/updateD1DB";
import updateMailsStore from "./utils/updateMailsStore";

import throwExtendedError from "../../../utils/throwExtendedError";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function handlePOST(request: Request, env: ENV) {
  const { event, model } = await request.json<any>();

  if (request.headers.get("Webhook-Secret") === env.STRAPI_WEBHOOK_SECRET) {
    let updatedD1DB: boolean, updatedMailsStore: boolean;

    if (event !== "trigger-test") {
      try {
        updatedD1DB = await updateD1DB(model);
      } catch (error) {
        await throwExtendedError({
          error,
          subject: "Strapi: Error updating 'strapi' table in database",
          bodyText:
            "Error updating 'strapi' table in database. Please look into the issue.",
        });
      }
    }

    if (
      event === "trigger-test" ||
      (["entry.update", "entry.publish"].includes(event) &&
        ["e-mail", "recurring-element"].includes(model))
    ) {
      try {
        updatedMailsStore = await updateMailsStore();
      } catch (error) {
        await throwExtendedError({
          error,
          subject: "Strapi: Error updating MAILS store",
          bodyText: "Error updating MAILS store. Please look into the issue.",
        });
      }
    }

    const success = updatedD1DB || updatedMailsStore;

    return reply(
      {
        success,
        message: success ? undefined : "No op",
      },
      200,
    );
  }

  return reply({ success: false, error: "Bad Request" }, 400);
}

handlePOST.retry = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
