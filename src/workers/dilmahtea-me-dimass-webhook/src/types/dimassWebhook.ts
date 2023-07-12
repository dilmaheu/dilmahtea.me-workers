declare interface DeliveryAddress {
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

declare interface OrderLine {
  id: number;
  article: Article;
  quantity: number;
  external_id: any;
}

declare interface Article {
  id: number;
  code: string;
  name: string;
  ean: any;
  external_id: any;
  primary_barcode: string;
}

declare interface Partner {
  code: string;
  name: string;
}

declare interface Order {
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

declare interface ShipmentLine {
  id: number;
  quantity: number;
  order_line: OrderLine;
}

declare interface ShipmentColli {
  id: number;
  tracking_url: string;
  courier_reference: string;
  courier_code: string;
}

export interface Shipment {
  id: number;
  order: Order;
  state: 0 | 5 | 10 | 15;
  sub_state: 1500 | 1530 | null;
  shipment_lines: ShipmentLine[];
  shipment_colli: ShipmentColli[];
}

export type WebhookResponseData = Order | Shipment;

// /**
//  * Dimass webhook event types
//  */
// declare type WebhookEvent =
//   | "order_created"
//   | "order_state_updated"
//   | "order_removed"
//   | "shipment_pick"
//   | "shipment_packed"
//   | "shipment_shipped"
//   | "shipment_delivered"
//   | "shipment_removed"
//   | "purchase_order_created"
//   | "purchase_order_state_updated"
//   | "goods_receipt_created"
//   | "goods_receipt_state_updated"
//   | "goods_return_created"
//   | "goods_return_receiving_goods"
//   | "goods_return_finalized"
//   | "goods_return_receipt_created"
//   | "goods_return_receipt_booked";

// declare type OrderEvent =
//   | "order_created"
//   | "order_state_updated"
//   | "order_removed";

// declare type ShipmentEvent =
//   | "shipment_pick"
//   | "shipment_packed"
//   | "shipment_shipped"
//   | "shipment_delivered"
//   | "shipment_removed";

// declare type PurchaseOrderEvent =
//   | "purchase_order_created"
//   | "purchase_order_state_updated";

// declare type GoodsReturnEvent =
//   | "goods_return_created"
//   | "goods_return_receiving_goods"
//   | "goods_return_finalized";

// declare type GoodsReceiptEvent =
//   | "goods_receipt_created"
//   | "goods_receipt_state_updated";

// declare type GoodsReturnReceiptEvent =
//   | "goods_return_receipt_created"
//   | "goods_return_receipt_booked";
