import { reply } from "../../../../utils/createModuleWorker";

import getStockInfo from "./getStockInfo";
import updateStrapiProducts from "./updateStrapiProducts";
import getStrapiProductsData from "./getStrapiProductsData";

export default async function updateStock() {
  const productsStockInfo = await getStockInfo();

  if (productsStockInfo.length === 0) {
    return reply(
      {
        success: false,
        message: "The items to update aren't relevant for the CMS.",
      },
      400,
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
