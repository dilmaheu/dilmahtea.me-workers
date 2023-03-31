import { Env, WebhookResponseData } from "./types";
import getProductBySku from "./utils/get-product-by-sku";
import getStockDimass from "./utils/get-stock-dimass";

type ProductsToUpdateType = {
  id?: string;
  SKU: string;
  quantity: string;
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method === "POST") {
      const data = await request.json<WebhookResponseData>();

      const dimassRes = await getStockDimass(env, data.order_date);

      return new Response(JSON.stringify(dimassRes, null, 2), {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    }

    // for now just fetch the stock and return this in the response.
    const dimassRes = await getStockDimass(env, "2023-03-26T15:00:21+01:00");

    const productsToUpdate: ProductsToUpdateType[] = dimassRes.map((p) => ({
      id: "",
      SKU: p.SKU,
      quantity: typeof p.availableStock === "string" ? p.availableStock : "0",
    }));

    const graphqlUrl = "https://cms.dilmahtea.me/graphql";
    const idsFromStrapi = await fetch(graphqlUrl, {
      method: "POST",
      body: JSON.stringify({
        query: ` query {
          products(publicationState: PREVIEW, filters: {
            SKU: {
              in: ${productsToUpdate.map((product) => product.SKU)}
            }
            }) {
            data {
              id
              attributes {
                SKU
                Stock_amount
              }
            }
          }
        }
      }`,
      }),
    });

    const graphQlResponse = await idsFromStrapi.json();

    // const testStrapiFetch = await getProductBySku(dimassRes);

    return new Response(JSON.stringify(graphQlResponse, null, 2), {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  },
};
