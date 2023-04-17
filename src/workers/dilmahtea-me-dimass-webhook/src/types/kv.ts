export interface ENV {
  // KV
  CROWDFUNDING_EMAIL: KVNamespace;
  "__landing-workers_sites_assets_preview": KVNamespace;
  ECOMMERCE_PAYMENTS: KVNamespace;
  MAILS: KVNamespace;
  BASEROW_STATS: KVNamespace;
  ECOMMERCE_PAYMENTS_DEV: KVNamespace;
  CROWDFUNDINGS_DEV: KVNamespace;
  PRODUCTS: KVNamespace;
  CROWDFUNDINGS: KVNamespace;
  "landing-THEE": KVNamespace;
  "landing-THEE_preview": KVNamespace;
  TEST_STRAPI_UPDATES: KVNamespace;

  // `.env` / `.dev.vars`
  // DIMASS
  DIMASS_APIKEY: string;
  DIMASS_SECRET: string;
  DIMASS_URL: string;
  DIMASS_WEBHOOK_SECRET: string;

  // STRAPI
  STRAPI_APIKEY: string;
  STRAPI_URL: string;
}
