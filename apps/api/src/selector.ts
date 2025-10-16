type SelectShape<T extends Record<string, unknown>> = {
  [K in keyof T]?: boolean;
};

type SelectResult<
  T extends Record<string, unknown>,
  S extends SelectShape<T>,
> = {
  [K in Extract<keyof T, keyof S> as S[K] extends true ? K : never]: T[K];
};

function selectFields<
  T extends Record<string, unknown>,
  S extends SelectShape<T>,
>(obj: T, select: S): SelectResult<T, S> {
  const result = {} as Record<string, unknown>;
  for (const key in select) {
    if (select[key]) {
      result[key] = obj[key as keyof T];
    }
  }
  return result as SelectResult<T, S>;
}

type User = {
  id: number;
  email: string;
  name: string;
  posts: string[];
};

const userSlector: User = {
  id: 1,
  email: "hery@example.com",
  name: "Hery",
  posts: ["post1"],
};

const result = selectFields(userSlector, { id: true });

// ✅ Type inféré automatiquement :
/*
   result: {
     id: number;
     name: string;
   }
*/

console.log(result.id);
