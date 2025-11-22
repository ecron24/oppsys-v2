type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Lowercase<T>}${CamelToSnake<U>}`
    : `${Lowercase<T>}_${CamelToSnake<Uncapitalize<U>>}`
  : Lowercase<S>;

type CamelToSnakeObject<T> = {
  [K in keyof T as CamelToSnake<Extract<K, string>>]: T[K] extends Array<
    infer U
  >
    ? CamelToSnakeObject<U>[]
    : T[K] extends object
      ? CamelToSnakeObject<T[K]>
      : T[K];
};

export function camelToSnake(str: string): string {
  if (!str) return str;

  // Insert underscore between a lowercase/digit and an uppercase letter: fooBar -> foo_Bar
  // Also insert underscore between an acronym and a following capitalized word: HTTPServer -> HTTP_Server
  const withBoundaries = str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2");

  return withBoundaries.toLowerCase();
}

export function toSnakeCase<T extends object>(obj: T): CamelToSnakeObject<T> {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as CamelToSnakeObject<T>;
  }

  if (obj !== null && typeof obj === "object") {
    // Leave non-plain objects (Date, RegExp, Map, Set, etc.) intact
    const toString = Object.prototype.toString.call(obj);
    if (toString !== "[object Object]") {
      return obj as CamelToSnakeObject<T>;
    }

    const result = Object.keys(obj).reduce(
      (acc, key) => {
        const snakeKey = camelToSnake(key);
        const value = (obj as Record<string, unknown>)[key];

        if (Array.isArray(value)) {
          acc[snakeKey] = value.map((v) =>
            v !== null && typeof v === "object" ? toSnakeCase(v) : v
          );
        } else if (value !== null && typeof value === "object") {
          const valueTag = Object.prototype.toString.call(value);
          if (valueTag === "[object Object]") {
            acc[snakeKey] = toSnakeCase(value);
          } else {
            // Preserve Date, RegExp, Map, Set, etc.
            acc[snakeKey] = value;
          }
        } else {
          acc[snakeKey] = value;
        }

        return acc;
      },
      {} as Record<string, unknown>
    );

    return result as CamelToSnakeObject<T>;
  }

  return obj as CamelToSnakeObject<T>;
}
