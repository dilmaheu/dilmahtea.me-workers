export default async function sendInvoice(
  orderID,
  orderNumber,
  fetchExactAPI,
  env
) {
  await fetchExactAPI("POST", "/salesinvoice/InvoiceSalesOrders", {
    CreateMode: 1,
    InvoiceMode: 1,
    JournalCode: env.JOURNAL_CODE,
    SalesOrderIDs: [{ ID: orderID }],
  });

  console.log("Exact: Sales invoice created successfully");

  const invoice = await fetchExactAPI(
    "GET",
    `/salesinvoice/SalesInvoices?$filter=OrderNumber eq ${orderNumber}&$select=InvoiceID`
  );

  const { "d:InvoiceID": invoiceID } =
    invoice.feed.entry.content["m:properties"];

  await fetchExactAPI("POST", "/salesinvoice/PrintedSalesInvoices", {
    InvoiceID: invoiceID,
    SendEmailToCustomer: true,
  });

  console.log("Exact: Sales invoice sent successfully");
}
