type ENV = Record<string, string | KVNamespace>;

let environment;

export function setENV(env: ENV): void {
  environment = env;
}

export default function env<T = ENV>(): T {
  return environment as T;
}
