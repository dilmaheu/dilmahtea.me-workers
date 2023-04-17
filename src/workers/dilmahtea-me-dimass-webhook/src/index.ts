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
      console.log(request.headers.get("X-SP-Event"));

      const incomingSignature = request.headers.get("X-SP-Signature");

      if (!incomingSignature) {
        throw new Error("No secret signature was provided.");
      }

      const webhookData = await request.json<WebhookResponseData>();

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        // encode the secret
        encoder.encode(env.DIMASS_WEBHOOK_SECRET),
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"]
      );

      const webhookPayload = JSON.stringify(webhookData);
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        // encode the request payload
        encoder.encode(webhookPayload)
      );

      /**
       * Constructing the expected signature from the request payload and the symmetric key
       *
       * **note**
       *
       * The typescript server thinks `btoa` is deprecated (because of node) but cloudflare still uses & recommends it.
       */
      const expectedSignature = btoa(
        String.fromCharCode(...Array.from(new Uint8Array(signatureBuffer)))
      );

      /**Decoding the incoming signature taken from the header. */
      const incomingSignatureBytes = new Uint8Array(
        incomingSignature.length / 2
      );
      for (let i = 0; i < incomingSignatureBytes.length; i++) {
        const startIndex = i * 2;
        const endIndex = startIndex + 2;
        const hexByte = incomingSignature.slice(startIndex, endIndex);

        incomingSignatureBytes[i] = parseInt(hexByte, 16);
      }

      /**
       *
       * `btoa`: Decodes a string into bytes using Latin-1 (ISO-8859),
       * and encodes those bytes into a string using Base64.
       *
       * This was necessary because...??
       * Anyway if you don't do this it doesn't work;
       * the hashes won't match even though they should.
       */
      const incomingSignatureBase64 = btoa(
        String.fromCharCode(...incomingSignatureBytes)
      );

      /**
       * Authenticating the request.
       *
       * Checks if the signature matches the secret provided to the dimass webhook.
       *
       * ### References
       * 1. Dimass webhook - Headers: https://developer.supportplaza.nl/webhooks/introduction.html#headers
       * 2. Dimass webhook - Signature generation: https://developer.supportplaza.nl/webhooks/signature.html
       */
      if (!(expectedSignature === incomingSignatureBase64)) {
        throw new Error("Signature doesn't match.");
      }

      const dimassRes = await getStockDimass(env, true, webhookData.order_date);

      if (!Array.isArray(dimassRes)) {
        return new Response(
          JSON.stringify(
            {
              success: false,
              message: "The items to update aren't relevant for the CMS.",
            },
            null,
            2
          ),
          {
            status: 400,
            headers: {
              "content-type": "application/json;charset=UTF-8",
            },
          }
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
      const skus = productsToUpdate.map((product) => product.SKU);

      console.log(skus);

      const idsFromStrapiData = await getStrapiProductIds(env, skus);

      if (idsFromStrapiData.data.length === 0) {
        throw new Error(
          "The product(s) with the provided SKU('s) don't exist in strapi (yet)."
        );
      }

      console.log("idsfromstrapidata: ", idsFromStrapiData);
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

      console.log("productids[0]: ", productIds[0]);

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

    const dimassRes = await getStockDimass(env, false);

    if (!Array.isArray(dimassRes)) {
      return new Response(
        JSON.stringify(
          {
            success: false,
            message: "The items to update aren't relevant for the CMS.",
          },
          null,
          2
        ),
        {
          status: 400,
          headers: {
            "content-type": "application/json;charset=UTF-8",
          },
        }
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
    const skus = productsToUpdate.map((product) => product.SKU);

    console.log(skus);

    const idsFromStrapiData = await getStrapiProductIds(env, skus);

    if (idsFromStrapiData.data.length === 0) {
      throw new Error(
        "The product(s) with the provided SKU('s) don't exist in strapi (yet)."
      );
    }

    console.log("idsfromstrapidata: ", idsFromStrapiData);
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

    console.log("productids[0]: ", productIds[0]);

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
