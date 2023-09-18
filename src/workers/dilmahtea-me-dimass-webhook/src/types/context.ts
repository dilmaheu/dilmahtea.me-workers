export type Context = Partial<{
  DeliveryDate: string;
  hasInvoicedSalesOrder: boolean;
  hasSentInvoice: boolean;
  hasCreatedGoodsDelivery: boolean;
}>;
