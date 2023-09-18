export interface SalesOrder {
  [key: string]: any;
  entry: {
    [key: string]: any;
    content: {
      "m:properties": {
        [key: string]: any;
        "d:OrderNumber": string;
      };
    };
  };
}
