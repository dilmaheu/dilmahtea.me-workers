// @ts-check

import syncProductsPricings from "./utils/syncProductsPricings";
import fetchExactAPIConstructor from "../../../utils/fetchExactAPIConstructor";

export default {
  async scheduled(_, env, ctx) {
    ctx.waitUntil(
      new Promise(async (resolve) => {
        const fetchExactAPI = fetchExactAPIConstructor(env);

        const TIMESTAMP_TOKEN_KEY = "HIGHEST_TIMESTAMP_" + env.ENVIRONMENT,
          LAST_HIGHEST_TIMESTAMP = Number(
            await env.EXACT_TOKENS.get(TIMESTAMP_TOKEN_KEY),
          );

        const SalesItemPrices = await fetchExactAPI(
          "GET",
          `/sync/Logistics/SalesItemPrices?$filter=Timestamp gt ${LAST_HIGHEST_TIMESTAMP}L&$select=Timestamp,ItemCode,Price`,
        )
          .then(({ feed }) => {
            if (!feed.entry) {
              resolve("No op!");
            } else {
              return [feed.entry].flat().reverse();
            }
          })
          .then((entries) =>
            // @ts-ignore
            entries.map(({ content }) => content["m:properties"]),
          );

        const ItemsRecord = Object.fromEntries(
          SalesItemPrices.map((Item) => [Item["d:ItemCode"], Item["d:Price"]]),
        );

        const syncedProductPricingsResponseMessage = await syncProductsPricings(
          ItemsRecord,
          env,
        );

        if (syncedProductPricingsResponseMessage === "Pricings synced") {
          const HIGHEST_TIMESTAMP = Math.max(
            ...SalesItemPrices.map((Item) => Item["d:Timestamp"]),
          );

          await env.EXACT_TOKENS.put(TIMESTAMP_TOKEN_KEY, HIGHEST_TIMESTAMP);
        }

        resolve(syncedProductPricingsResponseMessage);
      }),
    );
  },
};
