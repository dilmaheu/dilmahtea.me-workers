import type { Item } from "../types";

import { reply } from "../../../../utils/createModuleWorker";

import getStockItems from "./getStockItems";
import updateStrapiProducts from "./updateStrapiProducts";
import getStrapiProductsData from "./getStrapiProductsData";

export default async function updateStock(since: string) {
  const item = await getStockItems(since);

  if (!item) {
    return reply(
      {
        success: false,
        message: "No items to update.",
      },
      200,
    );
  }

  const productsStockInfo = ((Array.isArray ? item : [item]) as Item[]).map(
    (item) => ({
      stockAmount: item.availableStock,
      /** SKU value without Dimass's 'DILM' prefix. */
      SKU: item.code.split(" ").pop() as string,
    }),
  );

  if (productsStockInfo.length === 0) {
    return reply(
      {
        success: false,
        message: "The items to update aren't relevant for the CMS.",
      },
      200,
    );
  }

  // array of SKU's to query Strapi
  const SKUs = productsStockInfo.map((product) => product.SKU),
    strapiProductsData = await getStrapiProductsData(SKUs);

  if (strapiProductsData.length === 0) {
    throw new Error(
      "The product(s) with the provided SKU(s) don't exist in strapi (yet).",
    );
  }

  await updateStrapiProducts(strapiProductsData, productsStockInfo);

  return reply({ success: true, message: "Stock updated" }, 200);
}
