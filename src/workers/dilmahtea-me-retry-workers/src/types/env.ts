export interface ENV {
  // ENVIRONMENTAL VARIABLES
  EMAIL_WORKER_URL: string;

  // KV
  WORKER_REQUESTS: KVNamespace;

  // D1
  USERS: D1Database;

  // SERVICES
  EMAIL: Fetcher;

  // STRIPE
  STRIPE_DEV_SIGNING_SECRET_KEY: string;
  STRIPE_PROD_SIGNING_SECRET_KEY: string;

  // DKIM
  DKIM_PRIVATE_KEY: string;
  MATRIX_ROOM_ID: string;
  MATRIX_BOT_ACCESS_TOKEN: string;

  // SECURE WORKERS
  CF_SECURE_WORKER_TOKEN: string;
}
