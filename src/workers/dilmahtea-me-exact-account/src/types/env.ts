export interface ENV {
  // D1
  USERS: D1Database;

  // KV
  EXACT_TOKENS: KVNamespace;
  EXACT_GUID_COLLECTION: KVNamespace;

  // DKIM MAILCHANNELS
  DKIM_PRIVATE_KEY: string;

  // EXACT
  EXACT_API_ENDPOINT: string;

  // EXACT ACCOUNT WORKER
  CF_SECURE_WORKER_TOKEN: string;
}
