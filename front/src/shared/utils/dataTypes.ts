export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === "function";
}
