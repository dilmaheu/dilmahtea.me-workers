import { ENV } from "../types";

import getStockInfo from "./getStockInfo";
import updateStrapiProducts from "./updateStrapiProducts";
import getStrapiProductsData from "./getStrapiProductsData";
import { reply } from "../../../../utils/createModuleWorker";

export default async function updateStock(env: ENV) {
  const productsStockInfo = await getStockInfo(env);

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

  // array of SKU's to query Strapi
  const SKUs = productsStockInfo.map((product) => product.SKU),
    strapiProductsData = await getStrapiProductsData(env, SKUs);

  if (strapiProductsData.length === 0) {
    throw new Error(
      "The product(s) with the provided SKU(s) don't exist in strapi (yet)."
    );
  }

  await updateStrapiProducts(env, strapiProductsData, productsStockInfo);

  return reply(
    JSON.stringify({ success: true, message: "Stock updated" }, null, 2),
    200
  );
}
