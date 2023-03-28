export interface GetDimassStockResponse {
  "SOAP-ENV:Envelope": SoapEnvEnvelope;
}

export interface SoapEnvEnvelope {
  "xmlns:SOAP-ENV": string;
  "xmlns:ns1": string;
  "xmlns:xsi": string;
  "SOAP-ENV:Body": SoapEnvBody;
}

export interface SoapEnvBody {
  "ns1:getStockResponse": Ns1GetStockResponse;
}

export interface Ns1GetStockResponse {
  return: Return;
}

export interface Return {
  item: Item[];
}

export interface Item {
  code: string;
  availableStock: string | StockNil;
  freeStock: string | StockNil;
  ean: any;
  blockedStock: string | StockNil;
  defectStock: string | StockNil;
  returnStock: string | StockNil;
}

export interface StockNil {
  "xsi:nil": string;
}

export interface Root {
  code: string;
  availableStock: string;
  freeStock: string;
  ean: string;
  blockedStock: string;
  defectStock: string;
  returnStock: string;
  SKU: string;
}
