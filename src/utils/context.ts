import env from "./env";
import hash from "./hash";

type Context = Record<string, any>;

let key: string,
  context: Context = {};

export default new Proxy(
  {},
  {
    get: (_, prop: string) => context[prop],
    set: (_, prop: string, value: any) => {
      context[prop] = value;

      return true;
    },
  },
) as Context;

export async function setupContext(request: Request, id: string | number) {
  // remove retry attempt params from URL
  const requestURL = new URL(request.url);

  requestURL.searchParams.delete("attempt");
  requestURL.searchParams.delete("requestID");

  const contextID = requestURL.toString() + id;

  key = await hash(contextID, "SHA-256");

  const storedContext = await (env.WORKER_CONTEXTS as KVNamespace).get(key);

  if (storedContext) {
    context = JSON.parse(storedContext);
  }
}

export async function storeContext() {
  if (key && context) {
    await (env.WORKER_CONTEXTS as KVNamespace).put(
      key,
      JSON.stringify(context),
    );
  }
}
