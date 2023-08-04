// @ts-check

import updateProductPrice from "./utils/updateProductPrice";

import validateSignature from "../../../utils/validateSignature";
import createModuleWorker from "../../../utils/createModuleWorker";
import fetchExactAPIConstructor from "../../../utils/fetchExactAPIConstructor";

async function handlePOST(request, env) {
  const webhookData = await request.json(),
    { Content, HashCode } = webhookData;

  await validateSignature(
    Content,
    "SHA-256",
    HashCode.toLowerCase(),
    env.EXACT_WEBHOOK_SECRET
  );

  const fetchExactAPI = fetchExactAPIConstructor(env);

  const { ExactOnlineEndpoint } = Content,
    item = await fetchExactAPI("GET", ExactOnlineEndpoint);

  const itemProperties = item.entry.content["m:properties"],
    { "d:Code": itemCode, "d:StandardSalesPrice": itemPrice } = itemProperties;

  return await updateProductPrice(itemCode, itemPrice, env);
}

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
