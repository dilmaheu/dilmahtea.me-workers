const headers = new Headers({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "-1",
});

export const reply = (message, status) => {
  return new Response(message, { status, headers });
};

const handleOPTIONS = (request) => {
  if (
    request.headers.get("Origin") ??
    request.headers.get("Access-Control-Request-Method") ??
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, { headers });
  }

  // Handle standard OPTIONS request.
  return new Response(null, { headers: { Allow: "POST, OPTIONS" } });
};

export default function ({ pathname: endpointPathname, methods }) {
  const worker = {
    async fetch(request, env, ctx) {
      let { pathname } = new URL(request.url);

      if (pathname === endpointPathname) {
        const { method } = request;

        methods.OPTIONS = handleOPTIONS;

        if (method in methods) {
          const methodHandler = methods[method];

          try {
            return await methodHandler(request, env, ctx);
          } catch (error) {
            if (methodHandler.isPublic) {
              return reply(JSON.stringify({ error: error.message }), 500);
            }

            throw error;
          }
        }
      }

      return reply(
        JSON.stringify({ error: `Method or Path Not Allowed` }),
        405
      );
    },
  };

  return worker;
}
