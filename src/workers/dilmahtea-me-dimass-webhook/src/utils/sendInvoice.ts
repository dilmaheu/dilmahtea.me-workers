import env from "../env";
import context from "../context";
import fetchExactAPI from "../../../../utils/fetchExactAPI";

export default async function sendInvoice(
  orderID,
  orderNumber,
  tracking_url,
  shippingMethodID,
) {
  const OrderedBy = await fetchExactAPI(
    "GET",
    `/salesorder/SalesOrders?$filter=OrderNumber eq ${orderNumber}`,
  ).then(({ feed }) => feed.entry.content["m:properties"]["d:OrderedBy"]);

  const Language = await fetchExactAPI(
    "GET",
    `/crm/Accounts(guid'${OrderedBy}')?$select=Language`,
  ).then(({ entry }) => entry.content["m:properties"]["d:Language"]);

  const [EmailLayout, DocumentLayout] = await Promise.all([
    env.EXACT_GUID_COLLECTION.get(`EMAIL_LAYOUT_${Language}`),
    env.EXACT_GUID_COLLECTION.get(`INVOICE_LAYOUT_${Language}`),
  ]);

  if (!context.hasInvoicedSalesOrder) {
    await fetchExactAPI("POST", "/salesinvoice/InvoiceSalesOrders", {
      CreateMode: 1,
      InvoiceMode: 1,
      JournalCode: env.JOURNAL_CODE,
      SalesOrderIDs: [{ ID: orderID }],
    });

    console.log("Exact: Sales invoice created successfully");

    context.hasInvoicedSalesOrder = true;
  }

  const {
    feed: { entry: Invoice },
  } = await fetchExactAPI(
    "GET",
    `/salesinvoice/SalesInvoices?$filter=OrderNumber eq ${orderNumber}&$select=InvoiceID`,
  );

  // resolve invoice creation failure in the next attempt
  if (!Invoice) {
    context.hasInvoicedSalesOrder = false;
  }

  const { "d:InvoiceID": InvoiceID } = Invoice.content["m:properties"];

  await env.USERS.prepare(
    "UPDATE orders SET status = ?, tracking_url = ? WHERE id = ?",
  )
    .bind("shipped", tracking_url, orderNumber)
    .run();

  await Promise.all([
    !context.hasSentInvoice &&
      fetchExactAPI("PUT", `/salesinvoice/SalesInvoices(guid'${InvoiceID}')`, {
        Description: tracking_url,
        ShippingMethod: shippingMethodID,
      }).then(async () => {
        await fetchExactAPI("POST", "/salesinvoice/PrintedSalesInvoices", {
          InvoiceID,
          EmailLayout,
          DocumentLayout,
          SendEmailToCustomer: true,
        });

        context.hasSentInvoice = true;
      }),
    !context.hasUpdatedShippingMethod &&
      fetchExactAPI("PUT", `/salesorder/SalesOrders(guid'${orderID}')`, {
        ShippingMethod: shippingMethodID,
      }).then(() => {
        context.hasUpdatedShippingMethod = true;
      }),
  ]);

  console.log("Exact: Sales invoice sent successfully");
}
