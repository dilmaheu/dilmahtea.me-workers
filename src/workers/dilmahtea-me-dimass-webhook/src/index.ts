import { ENV, WebhookResponseData } from "./types";
import getStockDimass from "./utils/get-stock-dimass";
import validateSignature from "./utils/validateSignature";
import getStrapiProductIds from "./utils/get-strapi-product-ids";
import updateStrapiProducts from "./utils/update-strapi-products";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

export interface ProductsStockInfo {
  SKU: string;
  stockAmount: number;
}

async function handlePOST(request: Request, env: ENV): Promise<Response> {
  const webhookData = await request.json<WebhookResponseData>();

  validateSignature(request, env, webhookData);

  const productsStockInfo = await getStockDimass(env);

  if (productsStockInfo.length === 0) {
    return reply(
      JSON.stringify(
        {
          success: false,
          message: "The items to update aren't relevant for the CMS.",
        },
        null,
        2
      ),
      400
    );
  }

  /** array of SKU's to query Strapi */
  const SKUs = productsStockInfo.map((product) => product.SKU),
    strapiProductsData = await getStrapiProductIds(env, SKUs);

  if (strapiProductsData.length === 0) {
    throw new Error(
      "The product(s) with the provided SKU(s) don't exist in strapi (yet)."
    );
  }

  /**
   * co-locating the SKU's and id's so that we can update the quantity for the correct SKU + id
   * - the `id` necessary to update strapi
   * - the `SKU` is necessary to know what the updated quantity is
   */
  await updateStrapiProducts(env, strapiProductsData, productsStockInfo);

  return reply(
    JSON.stringify(
      { success: true, message: "Stock has been updated." },
      null,
      2
    ),
    200
  );
}

export default createModuleWorker({
  pathname: "/",
  methods: { POST: handlePOST },
});
