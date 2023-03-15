export interface Env {
  // KV 
  CROWDFUNDING_EMAIL: any;
  "__landing-workers_sites_assets_preview": any;
  ECOMMERCE_PAYMENTS: any;
  MAILS: any;
  BASEROW_STATS: any;
  ECOMMERCE_PAYMENTS_DEV: any;
  CROWDFUNDINGS_DEV: any;
  PRODUCTS: any;
  CROWDFUNDINGS: any;
  "landing-THEE": any;
  "landing-THEE_preview": any;
  // `.env` / `.dev.vars`
  DIMASS_APIKEY: string;
  DIMASS_SIGNATURE: string;
  STRAPI_APIKEY: string;
}


export default {
  async fetch(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    console.log(`Hello World!`);
    return new Response("hello~!");
  },
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log(`Hello World!`);
  },
};
