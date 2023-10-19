// @ts-check

import fetchExactAPI from "../../../utils/fetchExactAPI";
import validateSignature from "../../../utils/validateSignature";
import throwExtendedError from "../../../utils/throwExtendedError";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";
import updateProductsSingleField from "../../../utils/updateProductsSingleField.js";

async function handlePOST(request: Request, env) {
  const body = await request.text(),
    [payload] = body.match(/(?<={"Content":).*(?=,"HashCode":"[0-9A-F]{64}")/);

  const { Content, HashCode } = JSON.parse(body);

  await validateSignature(
    payload,
    "SHA-256",
    HashCode.toLowerCase(),
    env.EXACT_WEBHOOK_SECRET,
  );

  const Item = await fetchExactAPI(
    "GET",
    Content.ExactOnlineEndpoint + "?$select=Code,SalesVatCode",
  );

  const { "d:Code": SKU, "d:SalesVatCode": VatCode } =
    Item.entry.content["m:properties"];

  if (VatCode) {
    const VatPercentage = await fetchExactAPI(
      "GET",
      `/vat/VATCodes?$filter=Code eq '${VatCode}'&$select=Percentage`,
    ).then(
      ({ feed }) => feed.entry.content["m:properties"]["d:Percentage"] * 100,
    );

    const response = await updateProductsSingleField(
      { [SKU]: VatPercentage },
      "VatPercentage",
      "Float",
    );

    return reply(response, 200);
  }

  return reply({ message: "No op!" }, 400);
}

handlePOST.retry = true;

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
