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
  // can also be just one Item.
  item: Item[] | Item | null;
}

export interface Item {
  code: string;
  availableStock: number;
  freeStock: number;
  ean: any;
  blockedStock: number;
  defectStock: number;
  returnStock: number;
}
