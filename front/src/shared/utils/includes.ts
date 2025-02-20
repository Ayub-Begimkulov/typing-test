export function includes<T>(arr: ReadonlyArray<T>, value: unknown): value is T {
  return arr.includes(value as T);
}
