export default async function sendInvoice(
  orderID,
  orderNumber,
  tracking_url,
  shippingMethodID,
  fetchExactAPI,
  env
) {
  await fetchExactAPI("POST", "/salesinvoice/InvoiceSalesOrders", {
    CreateMode: 1,
    InvoiceMode: 1,
    Description: tracking_url,
    JournalCode: env.JOURNAL_CODE,
    ShippingMethod: shippingMethodID,
    SalesOrderIDs: [{ ID: orderID }],
  });

  console.log("Exact: Sales invoice created successfully");

  const invoice = await fetchExactAPI(
    "GET",
    `/salesinvoice/SalesInvoices?$filter=OrderNumber eq ${orderNumber}&$select=InvoiceID`
  );

  const { "d:InvoiceID": invoiceID } =
    invoice.feed.entry.content["m:properties"];

  await Promise.all([
    fetchExactAPI("PUT", `/salesinvoice/SalesInvoices(guid'${invoiceID}')`, {
      Description: tracking_url,
      ShippingMethod: shippingMethodID,
    }).then(() =>
      fetchExactAPI("POST", "/salesinvoice/PrintedSalesInvoices", {
        InvoiceID: invoiceID,
        SendEmailToCustomer: true,
      })
    ),
    fetchExactAPI("PUT", `/salesorder/SalesOrders(guid'${orderID}')`, {
      ShippingMethod: shippingMethodID,
    }),
  ]);

  console.log("Exact: Sales invoice sent successfully");
}
