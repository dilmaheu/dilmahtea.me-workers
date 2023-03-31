import QueryString from "qs";
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

      // co-locating the SKU's and id's so that we can update the quantity for the correct SKU + id
      // - the `id` necessary to update strapi
      // - the `SKU` is necessary to know what the updated quantity is
      const productIds: {
        id: number;
        SKU: string;
      }[] = idsFromStrapiData.data.map((product) => ({
        id: product.id,
        SKU: product.attributes.SKU,
      }));

      const data = await updateStrapiProducts(
        env,
        productIds,
        productsToUpdate
      );

      // // Update the products with a PUT request and return the response object
      // const responses = await Promise.all(
      //   productIds.map(async ({ id, SKU }) => {
      //     const response: Response = await fetch(
      //       `https://cms.dilmahtea.me/api/products/${id}`,
      //       {
      //         headers: {
      //           "content-type": "application/json",
      //           Authorization:
      //             "Bearer e52e38edadb1d868ea22dfd2f43bb4c19e5a5d9af8114baf8e7581f8ca48f03c39d7a96fc4a204d31d964e3f2b0bb501bd8f825339e3630c9937862f1b7e13f5f04a184a438b03c184403d3927b2670b77883fef656a835ed0320cf2984b99c89ff6046643e08fead2a798bd9468e32e3f0d92c98e5f1f9f4a212faaa55c1662",
      //         },
      //         method: "PUT",
      //         body: JSON.stringify({
      //           data: {
      //             Stock_amount: productsToUpdate.find(
      //               (product) => product.SKU === SKU
      //             )?.quantity,
      //           },
      //         }),
      //       }
      //     );

      //     if (!response.ok) {
      //       throw new Error(response.statusText);
      //     }

      //     return response;
      //   })
      // );

      // // parse the data from the responses and return this; maybe not necessary
      // const data: StrapiResponseProduct[] = await Promise.all(
      //   responses.map(async (response) => {
      //     const productData: StrapiResponseProduct = await response.json();
      //     return productData;
      //   })
      // );

      // filter it so you have a summarized overview per product
      const filteredData = data.map((productResponse) => ({
        id: productResponse.data.id,
        SKU: productResponse.data.attributes.SKU,
        Stock_amount: productResponse.data.attributes.Stock_amount,
      }));

      // to test this feature working properly! SHOULD BE REMOVED!
      await env.TEST_STRAPI_UPDATES.put(
        new Date(orderDate).toISOString(),
        filteredData
      );

      return new Response(JSON.stringify(filteredData, null, 2), {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    }

    // simulate the moment the order came in
    // const webhookData = await request.json<WebhookResponseData>();

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

    // co-locating the SKU's and id's so that we can update the quantity for the correct SKU + id
    // - the `id` necessary to update strapi
    // - the `SKU` is necessary to know what the updated quantity is
    const productIds: {
      id: number;
      SKU: string;
    }[] = idsFromStrapiData.data.map((product) => ({
      id: product.id,
      SKU: product.attributes.SKU,
    }));

    const data = await updateStrapiProducts(env, productIds, productsToUpdate);

    // // Update the products with a PUT request and return the response object
    // const responses = await Promise.all(
    //   productIds.map(async ({ id, SKU }) => {
    //     const response: Response = await fetch(
    //       `https://cms.dilmahtea.me/api/products/${id}`,
    //       {
    //         headers: {
    //           "content-type": "application/json",
    //           Authorization:
    //             "Bearer e52e38edadb1d868ea22dfd2f43bb4c19e5a5d9af8114baf8e7581f8ca48f03c39d7a96fc4a204d31d964e3f2b0bb501bd8f825339e3630c9937862f1b7e13f5f04a184a438b03c184403d3927b2670b77883fef656a835ed0320cf2984b99c89ff6046643e08fead2a798bd9468e32e3f0d92c98e5f1f9f4a212faaa55c1662",
    //         },
    //         method: "PUT",
    //         body: JSON.stringify({
    //           data: {
    //             Stock_amount: productsToUpdate.find(
    //               (product) => product.SKU === SKU
    //             )?.quantity,
    //           },
    //         }),
    //       }
    //     );

    //     if (!response.ok) {
    //       throw new Error(response.statusText);
    //     }

    //     return response;
    //   })
    // );

    // // parse the data from the responses and return this; maybe not necessary
    // const data: StrapiResponseProduct[] = await Promise.all(
    //   responses.map(async (response) => {
    //     const productData: StrapiResponseProduct = await response.json();
    //     return productData;
    //   })
    // );

    // filter it so you have a summarized overview per product
    const filteredData = data.map((productResponse) => ({
      id: productResponse.data.id,
      SKU: productResponse.data.attributes.SKU,
      Stock_amount: productResponse.data.attributes.Stock_amount,
    }));

    // to test this feature working properly! SHOULD BE REMOVED!
    // await env.TEST_STRAPI_UPDATES.put(
    //   new Date(orderDate).toISOString(),
    //   filteredData
    // );

    return new Response(JSON.stringify(filteredData, null, 2), {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  },
};

// T-35 Change to GraphQL
// NOTES:
// const graphqlUrl = "https://cms.dilmahtea.me/graphql";
// const idsFromStrapi = await fetch(graphqlUrl, {
//   method: "POST",
//   headers: {
//     "content-type": "application/json",
//     Authorization:
//       "Bearer e52e38edadb1d868ea22dfd2f43bb4c19e5a5d9af8114baf8e7581f8ca48f03c39d7a96fc4a204d31d964e3f2b0bb501bd8f825339e3630c9937862f1b7e13f5f04a184a438b03c184403d3927b2670b77883fef656a835ed0320cf2984b99c89ff6046643e08fead2a798bd9468e32e3f0d92c98e5f1f9f4a212faaa55c1662",
//   },
//   body: JSON.stringify(
//     {
//       query: ` query ($skus: Array!) {
//       products(publicationState: PREVIEW, filters: {
//         SKU: {
//           in: $skus
//         }
//         }) {
//         data {
//           id
//           attributes {
//             SKU
//             Stock_amount
//           }
//         }
//       }
//     }
//   }`,
//       variables: {
//         skus,
//       },
//     },
//     null,
//     2
//   ),
// });

// const strapieGraphQlResponse = await idsFromStrapi.json();

// const testStrapiFetch = await getProductBySku(dimassRes);

// return new Response(JSON.stringify(strapiGraphResponse, null, 2), {
//   headers: {
//     "content-type": "application/json;charset=UTF-8",
//   },
// });
