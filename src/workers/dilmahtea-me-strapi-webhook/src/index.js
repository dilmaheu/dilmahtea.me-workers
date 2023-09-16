// @ts-check

import { updateMailsStore } from "./utils/updateMailsStore";

import throwExtendedError from "../../../utils/throwExtendedError";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function handlePOST(request, env) {
  const { event, model } = await request.json();

  if (
    request.headers.get("Webhook-Secret") === env.STRAPI_WEBHOOK_SECRET &&
    ["trigger-test", "entry.update", "entry.publish"].includes(event)
  ) {
    if (
      event === "trigger-test" ||
      [
        "recurring-element",
        "crowdfunding-email",
        "ecommerce-payment-confirmation-mail",
      ].includes(model)
    ) {
      try {
        return await updateMailsStore(env);
      } catch (error) {
        await throwExtendedError({
          error,
          subject: "Strapi: Error updating MAILS store",
          bodyText: "Error updating MAILS store. Please look into the issue.",
        });
      }
    }

    return reply({ message: "No op" }, 200);
  }

  return reply({ error: "Bad Request" }, 400);
}

handlePOST.retry = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
