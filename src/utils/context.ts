import env from "./env";

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
  const encodedID = new TextEncoder().encode(id),
    keyBuffer = await crypto.subtle.digest("SHA-1", encodedID);

  key = Array.from(new Uint8Array(keyBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

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
