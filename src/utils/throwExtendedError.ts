declare interface ExtendedError extends Error {
  subject: string;
  bodyText: string;
  requestData: Record<string, any>;
  responseData?: Record<string, any>;
  notifySales?: boolean;
}

declare interface Params {
  response?: Response;
  error?: ExtendedError;
  notifySales?: boolean;
  requestData?: Record<string, any>;
  subject: string;
  bodyText: string;
}

export default async function throwExtendedError({
  response,
  error,
  notifySales,
  requestData = {},
  subject,
  bodyText,
}: Params): Promise<ExtendedError> {
  error ||= new Error(
    response.status + " " + response.statusText,
  ) as ExtendedError;

  error.subject = subject;
  error.bodyText = bodyText;
  error.requestData = requestData;
  error.notifySales = notifySales;

  if (response) {
    const responseText = await response.text();

    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      responseData = responseText;
    }

    error.responseData = responseData;
  }

  throw error;
}
