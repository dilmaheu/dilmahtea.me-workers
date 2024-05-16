export interface ENV {
  // ENVIRONMENTAL VARIABLES
  FROM_NAME: string;
  FROM_EMAIL: string;
  DKIM_PRIVATE_KEY: string;

  // KV NAMESPACES
  MAILS: KVNamespace;

  // D1
  USERS: D1Database;

  // SECRETS
  CF_SECURE_WORKER_TOKEN: string;
}
