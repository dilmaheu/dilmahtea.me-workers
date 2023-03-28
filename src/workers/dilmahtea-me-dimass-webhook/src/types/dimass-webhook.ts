/**
 * DIMASS WEBHOOK RESPONSE TYPES
 * ### 1. ORDERS
 */
export interface WebhookResponseData {
  id: number;
  delivery_address: DeliveryAddress;
  email: string;
  external_id: string;
  order_date: string;
  order_number: string;
  order_lines: OrderLine[];
  partner: Partner;
  state: number;
}

export interface DeliveryAddress {
  id: number;
  firstname: string;
  lastname: string;
  company: string;
  street: string;
  house_number: any;
  zipcode: string;
  city: string;
  country: string;
  phone: any;
}

export interface OrderLine {
  id: number;
  article: Article;
  quantity: number;
  external_id: any;
}

export interface Article {
  id: number;
  code: string;
  name: string;
  ean: any;
  external_id: any;
  primary_barcode: string;
}

export interface Partner {
  code: string;
  name: string;
}

/**
 * Dimass webhook event types
 */
export type WebhookEvent =
  | "order_created"
  | "order_state_updated"
  | "order_removed"
  | "shipment_pick"
  | "shipment_packed"
  | "shipment_shipped"
  | "shipment_delivered"
  | "shipment_removed"
  | "purchase_order_created"
  | "purchase_order_state_updated"
  | "goods_receipt_created"
  | "goods_receipt_state_updated"
  | "goods_return_created"
  | "goods_return_receiving_goods"
  | "goods_return_finalized"
  | "goods_return_receipt_created"
  | "goods_return_receipt_booked";

export type OrderEvent =
  | "order_created"
  | "order_state_updated"
  | "order_removed";

export type ShipmentEvent =
  | "shipment_pick"
  | "shipment_packed"
  | "shipment_shipped"
  | "shipment_delivered"
  | "shipment_removed";

export type PurchaseOrderEvent =
  | "purchase_order_created"
  | "purchase_order_state_updated";

export type GoodsReturnEvent =
  | "goods_return_created"
  | "goods_return_receiving_goods"
  | "goods_return_finalized";

export type GoodsReceiptEvent =
  | "goods_receipt_created"
  | "goods_receipt_state_updated";

export type GoodsReturnReceiptEvent =
  | "goods_return_receipt_created"
  | "goods_return_receipt_booked";
