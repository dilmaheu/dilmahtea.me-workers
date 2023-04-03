import { Env, WebhookResponseData } from "./types";
import getStockDimass from "./utils/get-stock-dimass";
import getStrapiProductIds from "./utils/get-strapi-product-ids";
import updateStrapiProducts from "./utils/update-strapi-products";

export interface ProductsToUpdateType {
  id?: string;
  SKU: string;
  quantity: string;
  originalSku: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method === "POST") {
      const webhookData = await request.json<WebhookResponseData>();

      /** The timestamp from the incoming webhook request */
      const orderDate = webhookData.order_date;
      const dimassRes = await getStockDimass(env, orderDate);

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
      const skus = productsToUpdate.map((product) => product.SKU);

      const idsFromStrapiData = await getStrapiProductIds(env, skus);

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

      return new Response(
        JSON.stringify(
          { success: true, message: "Stock has been updated." },
          null,
          2
        ),
        {
          status: 200,
          headers: {
            "content-type": "application/json;charset=UTF-8",
          },
        }
      );
    }

    /** The timestamp from the incoming webhook request */
    const orderDate = new Date().toISOString();
    const dimassRes = await getStockDimass(env, orderDate);

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
    const skus = productsToUpdate.map((product) => product.SKU);

    const idsFromStrapiData = await getStrapiProductIds(env, skus);

    /**
     *  co-locating the SKU's and id's so that we can update the quantity for the correct SKU + id
     *  - the `id` necessary to update strapi
     *  - the `SKU` is necessary to know what the updated quantity is
     */
    const productIds: {
      id: number;
      SKU: string;
    }[] = idsFromStrapiData.data.map((product) => ({
      id: product.id,
      SKU: product.attributes.SKU,
    }));

    await updateStrapiProducts(env, productIds, productsToUpdate);

    return new Response(
      JSON.stringify(
        { success: true, message: "Stock has been updated." },
        null,
        2
      ),
      {
        status: 200,
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      }
    );
  },
};
