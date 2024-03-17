export interface ENV {
  // KV
  MAILS: KVNamespace;

  // D1
  USERS: D1Database;

  // STRAPI
  STRAPI_ACCESS_TOKEN: string;
  STRAPI_GRAPHQL_ENDPOINT: string;
  STRAPI_WEBHOOK_SECRET: string;
}
