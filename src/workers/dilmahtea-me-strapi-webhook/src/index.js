import { updateMailsStore } from "./utils/updateMailsStore";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

async function handlePOST(request, env) {
  const { event, model } = await request.json();

  if (
    request.headers.get("Webhook-Secret") === env.WEBHOOK_SECRET &&
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
      return await updateMailsStore(env);
    }

    return reply(JSON.stringify({ message: "No op" }), 200);
  }

  return reply(JSON.stringify({ error: "Bad Request" }), 400);
}

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
