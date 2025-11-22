import { describe, it, expect } from "vitest";
import {
  unwrap,
  type ResultSuccess,
  type ResultError,
  type ApiResponseSuccess,
  type ApiResponseError,
} from "../results";

describe("unwrap", () => {
  describe("success cases", () => {
    it("returns data for ResultSuccess", () => {
      const res: ResultSuccess<number> = { success: true, data: 42 };
      expect(unwrap(res)).toBe(42);
    });

    it("returns data for ApiResponseSuccess", () => {
      const res: ApiResponseSuccess<{ a: number }, 200> = {
        success: true,
        data: { a: 1 },
        status: 200,
      };
      expect(unwrap(res)).toEqual({ a: 1 });
    });

    it("returns data for plain success object", () => {
      const res = { success: true, data: "ok" } as const;
      expect(unwrap(res)).toBe("ok");
    });
  });

  describe("ApiResponseError cases", () => {
    it("throws ApiResponseError.error when no details", () => {
      const res: ApiResponseError = {
        success: false,
        error: "Something went wrong",
        status: 500,
      };
      expect(() => unwrap(res)).toThrow("Something went wrong");
    });

    it("throws ApiResponseError.error — includes details if provided", () => {
      const res: ApiResponseError = {
        success: false,
        error: "Validation failed",
        details: "email missing",
        status: 400,
      };
      expect(() => unwrap(res as any)).toThrow(
        "Validation failed — email missing"
      );
    });

    it("custom error parameter (string) overrides ApiResponseError message", () => {
      const res: ApiResponseError = {
        success: false,
        error: "Server blew up",
        status: 500,
      };
      expect(() => unwrap(res as any, "custom message")).toThrow(
        "custom message"
      );
    });

    it("custom error parameter (Error instance) is thrown instead of ApiResponseError", () => {
      const res: ApiResponseError = {
        success: false,
        error: "Ignored",
        status: 500,
      };
      const customErr = new Error("my-error-instance");
      try {
        unwrap(res as any, customErr);
        throw new Error("expected unwrap to throw");
      } catch (err) {
        // identity equality: the function should throw the provided Error instance
        expect(err).toBe(customErr);
      }
    });
  });

  describe("ResultError cases", () => {
    it("throws the Error instance contained in ResultError", () => {
      const err = new Error("boom");
      const res: ResultError<Error, "SOME_KIND"> = {
        success: false,
        kind: "SOME_KIND",
        error: err,
      };
      try {
        unwrap(res as any);
        throw new Error("expected unwrap to throw");
      } catch (caught) {
        expect(caught).toBe(err); // should rethrow the same Error instance
      }
    });

    it("throws when ResultError.error is a string", () => {
      const res: ResultError<string, "K"> = {
        success: false,
        kind: "K",
        error: "string-error",
      };
      expect(() => unwrap(res as any)).toThrow("string-error");
    });

    it("custom error param overrides ResultError.Error instance", () => {
      const err = new Error("original");
      const res: ResultError<Error, "K"> = {
        success: false,
        kind: "K",
        error: err,
      };
      // custom string -> becomes new Error("override")
      expect(() => unwrap(res as any, "override")).toThrow("override");

      // custom Error instance should be thrown (identity)
      const custom = new Error("custom-instance");
      try {
        unwrap(res as any, custom);
        throw new Error("expected unwrap to throw");
      } catch (caught) {
        expect(caught).toBe(custom);
      }
    });

    it("falls back to JSON.stringify for non-string / non-Error error", () => {
      const payload = { code: 123, msg: "bad" };
      const res: ResultError<typeof payload, "PAYLOAD"> = {
        success: false,
        kind: "PAYLOAD",
        error: payload,
      };
      // Should include the JSON stringified payload in the thrown message
      expect(() => unwrap(res)).toThrow(
        `Request failed (kind=PAYLOAD) ::${JSON.stringify(payload)}`
      );
    });

    it("handles circular error object by using kind in fallback message", () => {
      // create circular object so JSON.stringify throws
      const circular: any = {};
      circular.self = circular;

      const res: ResultError<any, "CIRC"> = {
        success: false,
        kind: "CIRC",
        error: circular,
      };

      // When JSON.stringify throws, unwrap should catch and produce a message using kind
      expect(() => unwrap(res)).toThrow("Request failed (kind=CIRC)");
    });

    it("custom error string overrides fallback for non-serializable error", () => {
      const circular: any = {};
      circular.self = circular;
      const res: ResultError<any, "CIRC"> = {
        success: false,
        kind: "CIRC",
        error: circular,
      };
      expect(() => unwrap(res, "override-fallback")).toThrow(
        "override-fallback"
      );
    });
  });

  describe("plain { success: false, error: string } case", () => {
    it("throws the string error", () => {
      const res = { success: false, error: "plain-error" };
      expect(() => unwrap(res as any)).toThrow("plain-error");
    });

    it("custom error param (Error) overrides plain string error", () => {
      const res = { success: false, error: "ignored" };
      const customErr = new Error("byebye");
      try {
        unwrap(res as any, customErr);
        throw new Error("expected unwrap to throw");
      } catch (caught) {
        expect(caught).toBe(customErr);
      }
    });
  });
});
