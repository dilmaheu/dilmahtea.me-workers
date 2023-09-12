import { setENV } from "./env";

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

      let { pathname } = new URL(request.url);

      if (pathname === endpointPathname) {
        const { method } = request;

        methods.OPTIONS = () => handleOPTIONS(methods);

        if (method in methods) {
          const methodHandler = methods[method];

          try {
            return await methodHandler(request, env, ctx);
          } catch (error) {
            if (methodHandler.catchError) {
              return reply({ error: `Error: ${error.message}` }, 500);
            }

            throw error;
          }
        }
      }

      return reply({ error: `Method or Path Not Allowed` }, 405);
    },
  };

  return worker;
}
