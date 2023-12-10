export type Context = Partial<{
  DeliveryDate: string;
  hasInvoicedSalesOrder: boolean;
  hasSentInvoice: boolean;
  hasUpdatedShippingMethod: boolean;
  hasCreatedGoodsDelivery: boolean;
}>;
