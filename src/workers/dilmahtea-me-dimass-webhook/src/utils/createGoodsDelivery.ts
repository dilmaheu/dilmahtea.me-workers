export default async function createGoodsDelivery(
  orderID,
  orderNumber,
  TrackingNumber,
  shippingMethodID,
  fetchExactAPI
) {
  const [orderLines, { currentLocalTime: currentAmsterdamTime }] =
    await Promise.all([
      fetchExactAPI(
        "GET",
        `/salesorder/SalesOrderLines?$filter=OrderNumber eq ${orderNumber}`
      ),
      fetch(
        "https://timeapi.io/api/TimeZone/zone?timeZone=Europe/Amsterdam"
      ).then(async (res) => res.json()) as Promise<Record<string, any>>,
    ]);

  const orderLinesEntries = [orderLines.feed.entry].flat();

  await Promise.all([
    fetchExactAPI("POST", "/salesorder/GoodsDeliveries", {
      TrackingNumber,
      ShippingMethod: shippingMethodID,
      DeliveryDate: currentAmsterdamTime,
      GoodsDeliveryLines: orderLinesEntries.map((orderLine) => ({
        SalesOrderLineID: orderLine.content["m:properties"]["d:ID"],
        QuantityDelivered: orderLine.content["m:properties"]["d:Quantity"],
      })),
    }),
    fetchExactAPI("PUT", `/salesorder/SalesOrders(guid'${orderID}')`, {
      DeliveryDate: currentAmsterdamTime,
    }),
  ]);

  console.log("Exact: Goods delivery created successfully");
}
