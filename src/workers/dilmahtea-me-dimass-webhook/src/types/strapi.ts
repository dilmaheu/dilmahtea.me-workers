export interface StrapiResponseProducts {
  data: {
    products: {
      data: Data[];
    };
  };
}

export interface StrapiResponseProduct {
  data: Data;
}
declare interface Data {
  id: number;
  attributes: Attributes;
}

declare interface Attributes {
  SKU: string;
  Stock_amount: number;
}
