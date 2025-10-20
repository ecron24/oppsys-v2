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

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function toCamelCase<T extends object>(obj: T): SnakeToCamelObject<T> {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase) as SnakeToCamelObject<T>;
  }

  if (obj !== null && typeof obj === "object") {
    const result = Object.keys(obj).reduce(
      (acc, key) => {
        const camelKey = snakeToCamel(key);
        const value = (obj as Record<string, unknown>)[key];
        acc[camelKey] =
          typeof value === "object" && value !== null
            ? toCamelCase(value)
            : value;
        return acc;
      },
      {} as Record<string, unknown>
    );
    return result as SnakeToCamelObject<T>;
  }

  return obj as SnakeToCamelObject<T>;
}
