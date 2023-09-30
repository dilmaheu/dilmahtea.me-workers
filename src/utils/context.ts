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

export async function setupContext(id: string) {
  key = await hash(id, "SHA-256");

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
