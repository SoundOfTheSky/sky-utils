import { ObjectAddPrefix } from './types';

/** Get all prorerty names, including in prototype */
export function getPropertyNames(e: object, keys = new Set()) {
  const own = Object.getOwnPropertyNames(e);
  for (let i = 0; i < own.length; i++) keys.add(own);
  const proto = Object.getPrototypeOf(e) as object;
  if (proto) getPropertyNames(proto, keys);
  return keys;
}

/** Map function like for arrays, but for objects */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const objectMap = <T>(object: object, fn: (key: string, val: T) => [string, any]) =>
  Object.fromEntries(Object.entries(object).map(([key, val]) => fn(key, val as T)));

/** Filter function like for arrays, but for objects */
export const objectFilter = <T>(object: object, fn: (key: string, val: T) => unknown) =>
  Object.fromEntries(Object.entries(object).filter(([key, val]) => fn(key, val as T)));

/** Adds prefix to every key in object */
export function addPrefixToObject<T extends Record<string, unknown>, P extends string>(
  obj: Record<string, T>,
  prefix: P,
): ObjectAddPrefix<T, P> {
  const n: Record<string, unknown> = {};
  for (const key in obj) n[prefix + key] = obj[key];
  return n as ObjectAddPrefix<T, P>;
}

/** Check if objects are deep equal
 *
 * **Supports:**
 * - All primitives (String, Number, BigNumber, Null, undefined, Symbol)
 * - Objects
 * - Iterables (Arrays, Map, Sets, Queries, etc.)
 * - Dates
 *
 * **Not supported:**
 * - Functions
 * - Async iterables
 * - Promises
 * - etc
 *
 * Behavior with object above are not defined, but
 * it will still check them by reference.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function deepEquals(a: unknown, b: unknown, stack = new WeakSet()): boolean {
  // Primitives
  if (a === b) return true;
  if (typeof a !== typeof b || typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  // Assume that already checked objects are equal
  if (stack.has(a) || stack.has(b)) return true;
  stack.add(a);
  stack.add(b);
  // Arrays
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEquals(a[i], b[i], stack)) return false;
    return true;
  }
  if (Array.isArray(b)) return false;
  // Dates
  if (a instanceof Date) return b instanceof Date && a.getTime() === b.getTime();
  if (b instanceof Date) return false;
  // Iterables
  if (Symbol.iterator in a)
    return Symbol.iterator in b && deepEquals([...(a as Iterable<unknown>)], [...(b as Iterable<unknown>)], stack);
  if (Symbol.iterator in b) return false;
  // Other objects
  const aKeys = getPropertyNames(a);
  const bKeys = getPropertyNames(b);
  if (aKeys.size !== bKeys.size) return false;
  for (const property of getPropertyNames(a))
    if (!bKeys.has(property) || !deepEquals(a[property as keyof typeof a], b[property as keyof typeof b], stack))
      return false;
  return true;
}
