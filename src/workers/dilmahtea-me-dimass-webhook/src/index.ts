import { ENV, WebhookResponseData } from "./types";
import getStockDimass from "./utils/get-stock-dimass";
import validateSignature from "./utils/validateSignature";
import getStrapiProductIds from "./utils/get-strapi-product-ids";
import updateStrapiProducts from "./utils/update-strapi-products";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

export interface ProductsToUpdateType {
  id?: string;
  SKU: string;
  quantity: string;
  originalSku: string;
}

async function handlePOST(request: Request, env: ENV): Promise<Response> {
  const webhookData = await request.json<WebhookResponseData>();

  if (
    env.DIMASS_WEBHOOK_SECRET !== request.headers.get("Dimass-Webhook-Secret")
  ) {
    throw new Error("Invalid webhook secret");
  }

  // validateSignature(request, env, webhookData);

  const dimassRes = await getStockDimass(env, true, webhookData.order_date);

  if (!Array.isArray(dimassRes)) {
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

  /**
   * Dimass saves DILMAH SKU's with a 'DIMA' prefix; the `originalSku` field contains this data.
   * the 'SKU' is the same value that matches the SKU's in strapi without the 'DIMA' prefix.
   */
  const productsToUpdate: ProductsToUpdateType[] = dimassRes.map((p) => ({
    id: "",
    SKU: p.SKU,
    quantity: typeof p.availableStock === "string" ? p.availableStock : "0",
    originalSku: p.code,
  }));

  /** array of SKU's to query Strapi */
  const skus = productsToUpdate.map((product) => product.SKU),
    idsFromStrapiData = await getStrapiProductIds(env, skus);

  if (idsFromStrapiData.data.length === 0) {
    throw new Error(
      "The product(s) with the provided SKU('s) don't exist in strapi (yet)."
    );
  }

  /**
   * co-locating the SKU's and id's so that we can update the quantity for the correct SKU + id
   * - the `id` necessary to update strapi
   * - the `SKU` is necessary to know what the updated quantity is
   */
  const productIds: {
    id: number;
    SKU: string;
  }[] = idsFromStrapiData.data.map((product) => ({
    id: product.id,
    SKU: product.attributes.SKU,
  }));

  await updateStrapiProducts(env, productIds, productsToUpdate);

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
