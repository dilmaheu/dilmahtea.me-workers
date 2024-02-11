import env from "../env";

export default async function createD1Record(
  customerID,
  email,
  cart,
  orderNumber,
  order_date,
) {
  const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  let estimated_shipment_date: string | Date = new Date(order_date);

  if (estimated_shipment_date.getHours() >= 20) {
    estimated_shipment_date.setDate(estimated_shipment_date.getDate() + 1);
  }

  estimated_shipment_date = new Date(+estimated_shipment_date - timezoneOffset)
    .toISOString()
    .slice(0, 10);

  await env.USERS.prepare(
    "INSERT INTO orders (id, exact_account_guid, customer_email, customer_phone, status, order_date, estimated_shipment_date, estimated_delivery_date, delivery_date, tracking_url, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      orderNumber,
      customerID,
      email,
      null,
      "processing",
      order_date,
      estimated_shipment_date,
      null,
      null,
      null,
      JSON.stringify(
        Object.values(cart).map(({ sku, quantity }: any) => ({
          sku,
          quantity,
        })),
      ),
    )
    .run();
}
