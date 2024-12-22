export function hasOwn<T extends Record<string, any>>(
  obj: T,
  key: PropertyKey
): key is keyof T {
  return Object.hasOwn(obj, key);
}
