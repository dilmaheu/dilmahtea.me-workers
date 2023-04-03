export interface GetDimassStockResponse {
  "SOAP-ENV:Envelope": SoapEnvEnvelope;
}

declare interface SoapEnvEnvelope {
  "xmlns:SOAP-ENV": string;
  "xmlns:ns1": string;
  "xmlns:xsi": string;
  "SOAP-ENV:Body": SoapEnvBody;
}

declare interface SoapEnvBody {
  "ns1:getStockResponse": Ns1GetStockResponse;
}

declare interface Ns1GetStockResponse {
  return: Return;
}

declare interface Return {
  item: Item[];
}

declare interface Item {
  code: string;
  availableStock: string | StockNil;
  freeStock: string | StockNil;
  ean: any;
  blockedStock: string | StockNil;
  defectStock: string | StockNil;
  returnStock: string | StockNil;
}

declare interface StockNil {
  "xsi:nil": string;
}

declare interface Root {
  code: string;
  availableStock: string;
  freeStock: string;
  ean: string;
  blockedStock: string;
  defectStock: string;
  returnStock: string;
  SKU: string;
}
