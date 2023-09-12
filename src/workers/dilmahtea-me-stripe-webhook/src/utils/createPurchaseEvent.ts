export default function createPurchaseEvent({
  promises,
  origin_url,
  paymentIntentData,
}) {
  const { cart, request_headers } = paymentIntentData,
    purchasedProducts = Object.values(cart),
    purchaseEventRequestHeaders = new Headers(request_headers);

  purchaseEventRequestHeaders.set("Content-Type", "application/json");

  purchasedProducts.forEach((product: Record<string, any>) => {
    promises.push(
      fetch("https://plausible.io/api/event", {
        method: "POST",
        headers: Object.fromEntries(purchaseEventRequestHeaders),
        body: JSON.stringify({
          name: "Purchase",
          url: origin_url,
          domain: "dilmahtea.me",
          props: {
            SKU: product.sku,
            Title: JSON.parse(product.names).en,
            Currency: "EUR",
            Price: product.price,
            Quantity: product.quantity,
            Category: "Tea",
          },
        }),
      }),
    );
  });
}
