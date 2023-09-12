import fetchExactAPI from "../../../../utils/fetchExactAPI";

export default async function createGoodsDelivery(
  orderID,
  orderNumber,
  TrackingNumber,
  shippingMethodID,
) {
  const [orderLines, AmsterdamTime] = await Promise.all([
    fetchExactAPI(
      "GET",
      `/salesorder/SalesOrderLines?$filter=OrderNumber eq ${orderNumber}`,
    ),
    fetch(
      "https://timeapi.io/api/TimeZone/zone?timeZone=Europe/Amsterdam",
    ).then(async (res) => res.json()) as Promise<Record<string, any>>,
  ]);

  const DeliveryDate = AmsterdamTime.currentLocalTime,
    GoodsDeliveryLines = [orderLines.feed.entry].flat().map((orderLine) => ({
      SalesOrderLineID: orderLine.content["m:properties"]["d:ID"],
      QuantityDelivered: orderLine.content["m:properties"]["d:Quantity"],
    }));

  await Promise.all([
    fetchExactAPI("POST", "/salesorder/GoodsDeliveries", {
      TrackingNumber,
      ShippingMethod: shippingMethodID,
      DeliveryDate,
      GoodsDeliveryLines,
    }),
    fetchExactAPI("PUT", `/salesorder/SalesOrders(guid'${orderID}')`, {
      DeliveryDate,
    }),
  ]);

  console.log("Exact: Goods delivery created successfully");
}
