import { describe, it, expect } from "vitest";
import { deepMerge, type DeepPartial } from "../merge";

type TestType = {
  a: number;
  b?: number | null;
  c: {
    d: string;
    e?: number | null;
    f: {
      g: boolean;
    };
  };
  arr: number[];
  str?: string;
  fn?: () => string;
};

describe("deepMerge", () => {
  it("returns a shallow copy when patch is empty", () => {
    const base = { a: 1 };
    const result = deepMerge(base, {});

    expect(result).toEqual(base);
    expect(result).not.toBe(base);
  });

  it("overwrites a primitive value", () => {
    const base = { a: 1 };

    const result = deepMerge(base, { a: 2 });

    expect(result.a).toBe(2);
  });

  it("ignores null values in patch", () => {
    const base: { a: number | null } = { a: 1 };

    const result = deepMerge(base, { a: null });

    expect(result.a).toBe(1);
  });

  it("ignores undefined values in patch", () => {
    const base = { a: 1 };

    const result = deepMerge(base, { a: undefined });

    expect(result.a).toBe(1);
  });

  it("recursively merges nested objects", () => {
    const base = {
      c: {
        d: "hello",
        f: { g: true },
      },
    };

    const result = deepMerge(base, {
      c: {
        d: "world",
      },
    });

    expect(result.c.d).toBe("world");
    expect(result.c.f.g).toBe(true);
  });

  it("merges deeply nested objects", () => {
    const base: TestType = {
      a: 1,
      c: {
        d: "x",
        f: {
          g: false,
        },
      },
      arr: [1, 2],
    };

    const result = deepMerge(base, {
      c: {
        f: {
          g: true,
        },
      },
    });

    expect(result.c.f.g).toBe(true);
    expect(result.c.d).toBe("x");
  });

  it("replaces arrays instead of merging them", () => {
    const base = {
      arr: [1, 2, 3],
    };

    const result = deepMerge(base, {
      arr: [4, 5],
    });

    expect(result.arr).toEqual([4, 5]);
  });

  it("replaces an object with a primitive", () => {
    const base: {
      a: {
        x: number;
      };
    } = {
      a: { x: 1 },
    };

    const result = deepMerge(base, {
      a: 42 as unknown as DeepPartial<{ x: number }>,
    });

    expect(result.a).toBe(42);
  });

  it("replaces a primitive with an object", () => {
    const base: { a: number | { x: number } } = {
      a: 42,
    };

    const result = deepMerge(base, {
      a: { x: 1 },
    });

    expect(result.a).toEqual({ x: 1 });
  });

  it("replaces functions without attempting to merge them", () => {
    const base = {
      fn: () => "base",
    };

    const patchFn = () => "patch";

    const result = deepMerge(base, {
      fn: patchFn,
    });

    expect(result.fn).toBe(patchFn);
    expect(result.fn?.()).toBe("patch");
  });

  it("does not mutate the base object", () => {
    const base = {
      a: 1,
      c: {
        d: "x",
      },
    };

    const clonedBase = structuredClone(base);

    deepMerge(base, {
      c: { d: "y" },
    });

    expect(base).toEqual(clonedBase);
  });

  it("adds new keys that do not exist in base", () => {
    const base = {} as { a?: number };

    const result = deepMerge(base, {
      a: 1,
    });

    expect(result.a).toBe(1);
  });

  it("ignores null and undefined inside nested objects", () => {
    const base: {
      c: {
        d: string | null;
        e: number;
      };
    } = {
      c: {
        d: "hello",
        e: 10,
      },
    };

    const result = deepMerge(base, {
      c: {
        d: null,
        e: undefined,
      },
    });

    expect(result.c.d).toBe("hello");
    expect(result.c.e).toBe(10);
  });
});
