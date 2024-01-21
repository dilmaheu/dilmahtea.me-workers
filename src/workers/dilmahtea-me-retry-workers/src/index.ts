import type { ENV, ExtendedError } from "./types";

import hash from "../../../utils/hash";
import { reply } from "../../../utils/createModuleWorker";

import sendErrorEmail from "./utils/sendErrorEmail";
import sendErrorNotification from "./utils/sendErrorNotification";

export default {
  async scheduled(_, env: ENV, ctx) {
    ctx.waitUntil(
      new Promise(async (resolve: (value: void) => void) => {
        const currentMinute = new Date().toISOString().slice(0, 16);

        const requestIDs = JSON.parse(
          await env.WORKER_REQUESTS.get(currentMinute),
        );

        if (requestIDs) {
          await Promise.all([
            env.WORKER_REQUESTS.delete(currentMinute),
            Promise.all(
              requestIDs.map(async ({ attempt, requestID }) => {
                const storedRequest = JSON.parse(
                  await env.WORKER_REQUESTS.get(requestID),
                );

                if (storedRequest) {
                  const { url, method, headers, body } = storedRequest;

                  const retryAttemptURL = new URL(url);

                  retryAttemptURL.searchParams.set("attempt", attempt);
                  retryAttemptURL.searchParams.set("requestID", requestID);

                  if (headers["stripe-signature"]) {
                    const newTimestamp = Math.floor(Date.now() / 1000),
                      newSignature = await hash(
                        newTimestamp + "." + body,
                        "SHA-256",
                        retryAttemptURL.hostname.startsWith("dev.")
                          ? env.STRIPE_DEV_SIGNING_SECRET_KEY
                          : env.STRIPE_PROD_SIGNING_SECRET_KEY,
                      );

                    headers["stripe-signature"] = headers[
                      "stripe-signature"
                    ].replace(
                      /^t=\d+,v1=[a-z0-9]+/,
                      `t=${Math.floor(Date.now() / 1000)},v1=${newSignature}`,
                    );
                  }

                  return fetch(retryAttemptURL.toString(), {
                    method,
                    headers,
                    body,
                  });
                }
              }),
            ),
          ]);
        }

        resolve();
      }),
    );
  },

  async fetch(request: Request, env: ENV) {
    if (!["POST", "DELETE"].includes(request.method)) {
      return reply({ message: "Method or path not allowed!" }, 405);
    }

    switch (request.method) {
      case "POST": {
        const { error, stringifiedRequest } = await request.json<{
          error: ExtendedError;
          stringifiedRequest: string;
        }>();

        const requestID = crypto.randomUUID();

        await sendErrorEmail(error, requestID, env);

        let currentMinute = Math.ceil(Date.now() / (60 * 1000));

        const nextMinutes = Array.from({ length: 8 }).map(
          (_, i) => (currentMinute += 2 ** i),
        );

        await Promise.all(
          nextMinutes.map(async (nextMinute, i) => {
            const key = new Date(nextMinute * 60 * 1000)
              .toISOString()
              .slice(0, 16);

            const requestArray =
              JSON.parse(await env.WORKER_REQUESTS.get(key)) || [];

            requestArray.push({ attempt: i + 1, requestID });

            await env.WORKER_REQUESTS.put(key, JSON.stringify(requestArray));
          }),
        );

        await env.WORKER_REQUESTS.put(requestID, stringifiedRequest);

        return reply({ requestID, message: "Request stored!" }, 200);
      }

      case "DELETE": {
        const { error, requestID } = await request.json<{
          error: undefined | ExtendedError;
          requestID: string;
        }>();

        await Promise.all([
          env.WORKER_REQUESTS.delete(requestID),
          sendErrorEmail(error, requestID, env),
          error?.notifySales && sendErrorNotification(error, requestID, env),
        ]);

        return reply({ requestID, message: "Request removed!" }, 200);
      }
    }
  },
};
