export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K];
};

export function deepMerge<T extends Record<string, any>>(
  base: T,
  patch: DeepPartial<T>
): T {
  const result = { ...base } as T;

  for (const key in patch) {
    const patchValue = patch[key];
    const baseValue = base[key];

    // null ou undefined → on ignore
    if (patchValue === null || patchValue === undefined) {
      continue;
    }

    // objet imbriqué → merge récursif
    if (
      typeof baseValue === "object" &&
      typeof patchValue === "object" &&
      !Array.isArray(baseValue) &&
      !Array.isArray(patchValue)
    ) {
      result[key] = deepMerge(
        baseValue,
        patchValue as DeepPartial<typeof baseValue>
      ) as T[typeof key];
    } else {
      // primitive ou array → remplacement
      result[key] = patchValue as T[typeof key];
    }
  }

  return result;
}
