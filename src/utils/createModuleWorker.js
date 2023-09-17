// @ts-check

import { setENV } from "./env";
import { storeContext } from "./context";

const headers = new Headers({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "-1",
});

export const reply = (message, status) => {
  if (typeof message === "object") {
    console.log(message);

    message = JSON.stringify(message, null, 2);
  }

  return new Response(message, { status, headers });
};

const handleOPTIONS = (methods) =>
  new Response(null, {
    headers: {
      ...Object.fromEntries(headers),
      "access-control-allow-methods": Object.keys(methods).join(", "),
    },
  });

export default function ({ pathname: endpointPathname, methods }) {
  const worker = {
    async fetch(request, env, ctx) {
      setENV(env);

      let { pathname, hostname, origin, searchParams } = new URL(request.url);

      if (pathname === endpointPathname) {
        const { method } = request;

        methods.OPTIONS = () => handleOPTIONS(methods);

        if (method in methods) {
          const methodHandler = methods[method];

          let attempt, requestID, stringifiedRequest;

          if (methodHandler.retry) {
            attempt = searchParams.get("attempt");
            requestID = searchParams.get("requestID");

            if (!attempt && !requestID) {
              const clonedRequest = request.clone(),
                { url, method } = clonedRequest;

              const headers = Object.fromEntries(clonedRequest.headers);

              Object.keys(headers).forEach((header) => {
                if (header.toLowerCase().startsWith("cf-")) {
                  delete headers[header];
                }
              });

              stringifiedRequest = JSON.stringify({
                url,
                method,
                headers,
                body: await clonedRequest.text(),
              });
            }
          }

          let error;

          try {
            return await methodHandler(request, env, ctx);
          } catch (err) {
            error = err;

            if (methodHandler.catchError) {
              return reply({ error: `Error: ${err.message}` }, 500);
            }

            if (!methodHandler.retry) {
              throw err;
            }
          } finally {
            const isAnAttempt = !!(attempt && requestID),
              retryEnabled = methodHandler.retry,
              lastAttempt = error && isAnAttempt && attempt === "8";

            const shouldRetry = retryEnabled && error && !isAnAttempt,
              shouldClearRetrySchedule =
                retryEnabled && (lastAttempt || (!error && isAnAttempt));

            await Promise.all([
              storeContext(),
              (shouldRetry || shouldClearRetrySchedule) &&
                env.RETRY_WORKERS.fetch(request.url, {
                  method: shouldRetry ? "POST" : "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    requestID,
                    stringifiedRequest: shouldRetry
                      ? stringifiedRequest
                      : undefined,
                    error: error
                      ? {
                          message: error.message,
                          subject: error.subject || "Error in " + origin,
                          bodyText:
                            error.bodyText || "An error occurred in " + origin,
                          requestData: error.requestData,
                          responseData: error.responseData,
                          notifySales:
                            error.notifySales &&
                            lastAttempt &&
                            !hostname.startsWith("dev."),
                        }
                      : undefined,
                  }),
                }).then((res) => res.text()),
            ]);

            if (error) {
              return reply({ message: `Error: ${error.message}` }, 200);
            }
          }
        }
      }

      return reply({ error: `Method or Path Not Allowed` }, 405);
    },
  };

  return worker;
}
