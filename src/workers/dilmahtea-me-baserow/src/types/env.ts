export interface ENV {
  // KV
  CROWDFUNDINGS: KVNamespace;
  ECOMMERCE_PAYMENTS: KVNamespace;

  // D1
  USERS: D1Database;

  // BASEROW
  BASEROW_TOKEN: string;
  BASEROW_CROWDFUNDING_TABLE_ID: string;
  BASEROW_PAYMENT_RECORDS_TABLE_ID: string;
}
