import type {
  Request as WorkerRequest,
  ExecutionContext,
} from "@cloudflare/workers-types/2022-11-30";

type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "TRACE"
  | "PATCH";

export type HTTPMethodHandler<ENV> = (
  request: WorkerRequest,
  env: ENV,
  ctx: ExecutionContext
) => Response | Promise<Response>;

declare interface WorkerInit<ENV> {
  pathname: string;
  methods: Partial<Record<HTTPMethod, HTTPMethodHandler<ENV>>>;
}

const headers = new Headers({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "-1",
});

export const reply = (message: BodyInit, status: number) => {
  return new Response(message, { status, headers });
};

const handleOPTIONS = (request: WorkerRequest) => {
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

export default function createModuleWorker<ENV>({
  pathname: endpointPathname,
  methods,
}: WorkerInit<ENV>) {
  const worker = {
    async fetch(
      request: WorkerRequest,
      env: ENV,
      ctx: ExecutionContext
    ): Promise<Response> {
      let { pathname } = new URL(request.url);

      if (pathname === endpointPathname) {
        const { method } = request;

        methods.OPTIONS ||= handleOPTIONS;

        if (method in methods) {
          return methods[method](request, env, ctx);
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
