export interface ExtendedError {
  message: string;
  subject: string;
  bodyText: string;
  requestData: Record<string, any>;
  responseData?: Record<string, any>;
  notifySales?: boolean;
}
