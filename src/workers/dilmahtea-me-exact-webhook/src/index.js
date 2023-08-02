// @ts-check

import validateSignature from "./utils/validateSignature";
import updateProductPrice from "./utils/updateProductPrice";
import createModuleWorker from "../../../utils/createModuleWorker";
import fetchExactAPIConstructor from "../../../utils/fetchExactAPIConstructor";

async function handlePOST(request, env) {
  const webhookData = await request.json(),
    Content = await validateSignature(webhookData, env);

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
