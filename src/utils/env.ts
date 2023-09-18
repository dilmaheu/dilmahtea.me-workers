type ENV = Record<string, string | KVNamespace>;

let env: ENV = {};

export function setENV(environment: ENV): void {
  env = environment;
}

export default new Proxy(
  {},
  {
    get: (_, prop: string) => env[prop],
  },
) as ENV;
