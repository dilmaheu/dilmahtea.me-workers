import { SalesOrder } from "./exact";

export type Context = Partial<{
  hasCreatedOrder: boolean;
  hasCreatedPurchaseEvent: boolean;
  salesOrder: SalesOrder;
  hasCreatedDimassOrder: boolean;
  hasSentEmail: boolean;
  hasConfirmedOrderStatus: boolean;
}>;
