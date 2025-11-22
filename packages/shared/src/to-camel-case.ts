type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

type SnakeToCamelObject<T> = {
  [K in keyof T as SnakeToCamel<Extract<K, string>>]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? SnakeToCamelObject<U>[] // array
      : SnakeToCamelObject<T[K]> // nested object
    : T[K];
};

export function snakeToCamel(str: string): string {
  if (!str || !str.includes("_")) return str;

  const parts = str.split("_").filter((p) => p !== "");
  if (parts.length === 0) return "";

  const first = parts[0].toLowerCase();
  const rest = parts
    .slice(1)
    .map((p) => {
      if (p === "") return "";
      // keep pure numeric segments as-is
      if (/^\d+$/.test(p)) return p;
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .join("");

  return `${first}${rest}`;
}

export function toCamelCase<T extends object>(obj: T): SnakeToCamelObject<T> {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase) as SnakeToCamelObject<T>;
  }
  const isPlainObject = (v: unknown) =>
    Object.prototype.toString.call(v) === "[object Object]";

  if (obj !== null && typeof obj === "object" && isPlainObject(obj)) {
    const result = Object.keys(obj).reduce(
      (acc, key) => {
        const camelKey = snakeToCamel(key);
        const value = (obj as Record<string, unknown>)[key];

        if (Array.isArray(value)) {
          acc[camelKey] = toCamelCase(value);
        } else if (value !== null && typeof value === "object") {
          // preserve non-plain objects like Date, RegExp, Map, Set
          if (isPlainObject(value)) {
            acc[camelKey] = toCamelCase(value);
          } else {
            acc[camelKey] = value;
          }
        } else {
          acc[camelKey] = value;
        }

        return acc;
      },
      {} as Record<string, unknown>
    );

    return result as SnakeToCamelObject<T>;
  }

  return obj as SnakeToCamelObject<T>;
}
