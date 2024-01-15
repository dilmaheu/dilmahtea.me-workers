export interface ENV {
  // D1
  USERS: D1Database;

  // KV
  EXACT_TOKENS: KVNamespace;
  EXACT_GUID_COLLECTION: KVNamespace;

  // EXACT
  EXACT_API_ENDPOINT: string;

  // DKIM MAILCHANNELS
  DKIM_PRIVATE_KEY: string;
}
