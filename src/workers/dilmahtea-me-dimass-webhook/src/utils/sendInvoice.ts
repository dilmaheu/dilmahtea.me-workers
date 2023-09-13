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
    env.EXACT_LAYOUTS.get(`EMAIL_${Language}`),
    env.EXACT_LAYOUTS.get(`INVOICE_${Language}`),
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

  const invoice = await fetchExactAPI(
    "GET",
    `/salesinvoice/SalesInvoices?$filter=OrderNumber eq ${orderNumber}&$select=InvoiceID`,
  );

  const { "d:InvoiceID": InvoiceID } =
    invoice.feed.entry.content["m:properties"];

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
    fetchExactAPI("PUT", `/salesorder/SalesOrders(guid'${orderID}')`, {
      ShippingMethod: shippingMethodID,
    }),
  ]);

  console.log("Exact: Sales invoice sent successfully");
}
