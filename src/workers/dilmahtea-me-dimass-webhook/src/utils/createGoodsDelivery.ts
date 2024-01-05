import env from "../env";
import context from "../context";
import fetchExactAPI from "../../../../utils/fetchExactAPI";

export default async function createGoodsDelivery(
  orderID,
  orderNumber,
  TrackingNumber,
  shippingMethodID,
) {
  const { DeliveryDate } = context;

  await env.USERS.prepare(
    "UPDATE orders SET status = ?, delivery_date = ? WHERE id = ?",
  )
    .bind("delivered", DeliveryDate.slice(0, 10), orderNumber)
    .run();

  const orderLines = await fetchExactAPI(
    "GET",
    `/salesorder/SalesOrderLines?$filter=OrderNumber eq ${orderNumber}`,
  );

  const GoodsDeliveryLines = [orderLines.feed.entry]
    .flat()
    .map((orderLine) => ({
      SalesOrderLineID: orderLine.content["m:properties"]["d:ID"],
      QuantityDelivered: orderLine.content["m:properties"]["d:Quantity"],
    }));

  await Promise.all([
    !context.hasCreatedGoodsDelivery &&
      fetchExactAPI("POST", "/salesorder/GoodsDeliveries", {
        TrackingNumber,
        ShippingMethod: shippingMethodID,
        DeliveryDate,
        GoodsDeliveryLines,
      }).then(() => {
        context.hasCreatedGoodsDelivery = true;
      }),
    fetchExactAPI("PUT", `/salesorder/SalesOrders(guid'${orderID}')`, {
      DeliveryDate,
    }),
  ]);

  console.log("Exact: Goods delivery created successfully");
}
