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

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toSnakeCase<T extends object>(obj: T): CamelToSnakeObject<T> {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as CamelToSnakeObject<T>;
  }

  if (obj !== null && typeof obj === "object") {
    const result = Object.keys(obj).reduce(
      (acc, key) => {
        const snakeKey = camelToSnake(key);
        const value = (obj as Record<string, unknown>)[key];
        acc[snakeKey] =
          typeof value === "object" && value !== null
            ? toSnakeCase(value)
            : value;
        return acc;
      },
      {} as Record<string, unknown>
    );
    return result as CamelToSnakeObject<T>;
  }

  return obj as CamelToSnakeObject<T>;
}
