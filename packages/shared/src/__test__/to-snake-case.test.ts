import { describe, it, expect } from "vitest";
import { camelToSnake, toSnakeCase } from "../to-snake-case";

describe("camelToSnake", () => {
  it("should convert simple camelCase to snake_case", () => {
    expect(camelToSnake("helloWorld")).toBe("hello_world");
  });

  it("should convert PascalCase to snake_case (no leading underscore)", () => {
    // we expect normalization -> lowercase, no leading underscore
    expect(camelToSnake("HelloWorld")).toBe("hello_world");
  });

  it("should handle single word", () => {
    expect(camelToSnake("hello")).toBe("hello");
  });

  it("should handle empty string", () => {
    expect(camelToSnake("")).toBe("");
  });

  it("should handle consecutive capitals (acronyms)", () => {
    expect(camelToSnake("userID")).toBe("user_id");
    expect(camelToSnake("HTTPServer")).toBe("http_server");
  });

  it("should handle numbers", () => {
    expect(camelToSnake("helloWorld123")).toBe("hello_world123");
    expect(camelToSnake("version2Beta")).toBe("version2_beta");
  });

  it("should not alter already snake_case strings", () => {
    expect(camelToSnake("already_snake")).toBe("already_snake");
  });
});

describe("toSnakeCase", () => {
  describe("simple objects", () => {
    it("should convert simple flat object", () => {
      const input = { helloWorld: "value", fooBar: "baz" };
      const result = toSnakeCase(input);
      expect(result).toEqual({ hello_world: "value", foo_bar: "baz" });
    });

    it("should handle single property", () => {
      const input = { helloWorld: "value" };
      const result = toSnakeCase(input);
      expect(result).toEqual({ hello_world: "value" });
    });

    it("should handle empty object", () => {
      const input = {};
      const result = toSnakeCase(input);
      expect(result).toEqual({});
    });

    it("should preserve values of different types", () => {
      const input = {
        stringValue: "text",
        numberValue: 42,
        booleanValue: true,
        nullValue: null,
        undefinedValue: undefined,
      };
      const result = toSnakeCase(input);
      expect(result).toEqual({
        string_value: "text",
        number_value: 42,
        boolean_value: true,
        null_value: null,
        undefined_value: undefined,
      });
    });
  });

  describe("nested objects", () => {
    it("should convert nested object keys", () => {
      const input = {
        userInfo: {
          firstName: "John",
          lastName: "Doe",
        },
      };
      const result = toSnakeCase(input);
      expect(result).toEqual({
        user_info: {
          first_name: "John",
          last_name: "Doe",
        },
      });
    });

    it("should convert deeply nested objects", () => {
      const input = {
        levelOne: {
          levelTwo: {
            levelThree: "value",
          },
        },
      };
      const result = toSnakeCase(input);
      expect(result).toEqual({
        level_one: {
          level_two: {
            level_three: "value",
          },
        },
      });
    });

    it("should handle mixed nested structures", () => {
      const input = {
        userData: {
          personalInfo: {
            firstName: "Jane",
            emailAddress: "jane@example.com",
          },
          accountSettings: {
            twoFactorEnabled: true,
          },
        },
      };
      const result = toSnakeCase(input);
      expect(result).toEqual({
        user_data: {
          personal_info: {
            first_name: "Jane",
            email_address: "jane@example.com",
          },
          account_settings: {
            two_factor_enabled: true,
          },
        },
      });
    });
  });

  describe("arrays", () => {
    it("should convert array of objects", () => {
      const input = [
        { userId: 1, userName: "John" },
        { userId: 2, userName: "Jane" },
      ];
      const result = toSnakeCase(input);
      expect(result).toEqual([
        { user_id: 1, user_name: "John" },
        { user_id: 2, user_name: "Jane" },
      ]);
    });

    it("should handle empty array", () => {
      const input: object[] = [];
      const result = toSnakeCase(input);
      expect(result).toEqual([]);
    });

    it("should handle nested arrays", () => {
      const input = {
        userList: [
          {
            userId: 1,
            posts: [
              { postId: 101, postTitle: "First" },
              { postId: 102, postTitle: "Second" },
            ],
          },
        ],
      };
      const result = toSnakeCase(input);
      expect(result).toEqual({
        user_list: [
          {
            user_id: 1,
            posts: [
              { post_id: 101, post_title: "First" },
              { post_id: 102, post_title: "Second" },
            ],
          },
        ],
      });
    });

    it("should handle array of primitives", () => {
      const input = [1, "hello", true, null];
      const result = toSnakeCase(input);
      expect(result).toEqual([1, "hello", true, null]);
    });

    it("should handle mixed array", () => {
      const input = [{ firstName: "John" }, "string", 42, { lastName: "Doe" }];
      const result = toSnakeCase(input);
      expect(result).toEqual([
        { first_name: "John" },
        "string",
        42,
        { last_name: "Doe" },
      ]);
    });
  });

  describe("edge cases", () => {
    it("should handle null value", () => {
      const input = null;
      const result = toSnakeCase(input as any);
      expect(result).toBeNull();
    });

    it("should handle properties with no capitals", () => {
      const input = { hello: "world", foo: "bar" };
      const result = toSnakeCase(input);
      expect(result).toEqual({ hello: "world", foo: "bar" });
    });

    it("should handle properties with leading/trailing capitals (PascalCase)", () => {
      const input = { PrivateValue: "value", Public_: "value2" as any };
      // Public_ contains an underscore in key name: toSnakeCase should only transform camelCamel segments;
      // for unconventional keys the current implementation will insert underscores before capitals and lowercase everything.
      const result = toSnakeCase(input as any);
      expect(result).toEqual({ private_value: "value", public_: "value2" });
    });

    it("should handle numeric segments in keys", () => {
      const input = { user1Id: "value1", version2Beta: "v2" } as any;
      const result = toSnakeCase(input);
      expect(result).toEqual({ user1_id: "value1", version2_beta: "v2" });
    });

    it("should handle mixed case input", () => {
      const input = { userName: "John", firstName: "Doe" };
      const result = toSnakeCase(input);
      expect(result).toEqual({ user_name: "John", first_name: "Doe" });
    });

    it("should handle very long key names", () => {
      const input = {
        veryLongPropertyNameWithManySegments: "value",
      };
      const result = toSnakeCase(input);
      expect(result).toEqual({
        very_long_property_name_with_many_segments: "value",
      });
    });

    it("should handle special characters (leave non-camel keys untouched aside from camel->snake parts)", () => {
      const input = { "hello-world": "value", "foo@bar": "baz", someValue: 1 };
      const result = toSnakeCase(input as any);
      expect(result).toEqual({
        "hello-world": "value",
        "foo@bar": "baz",
        some_value: 1,
      });
    });

    it("should preserve object references for non-object values", () => {
      const obj = { userId: 1 };
      const result = toSnakeCase(obj);
      expect(result).not.toBe(obj); // new object
      expect((result as any).user_id).toBe(1);
    });

    it("should handle objects with Date objects (leave Date intact)", () => {
      const date = new Date("2024-01-01");
      const input = { createdAt: date };
      const result = toSnakeCase(input);
      expect(result).toEqual({ created_at: date });
    });

    it("should handle object with methods (methods are not enumerable)", () => {
      const input = { userName: "John" } as any;
      Object.defineProperty(input, "getName", {
        value: function () {
          return this.userName;
        },
        enumerable: false,
      });
      const result = toSnakeCase(input);
      expect(result).toEqual({ user_name: "John" });
    });

    it("should not infinitely recurse for nested objects (non-circular)", () => {
      const input = {
        userData: {
          profileInfo: {
            name: "John",
          },
        },
      };
      const result = toSnakeCase(input);
      expect(result).toEqual({
        user_data: {
          profile_info: {
            name: "John",
          },
        },
      });
    });

    it("should handle array of arrays", () => {
      const input = {
        matrixData: [
          [1, 2, 3],
          [4, 5, 6],
        ],
      };
      const result = toSnakeCase(input);
      expect(result).toEqual({
        matrix_data: [
          [1, 2, 3],
          [4, 5, 6],
        ],
      });
    });

    it("should handle complex real-world API response", () => {
      const input = {
        userId: 123,
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john@example.com",
        userSettings: {
          notificationEnabled: true,
          emailNotifications: false,
          pushNotifications: true,
        },
        recentPosts: [
          {
            postId: 1,
            postTitle: "First Post",
            createdAt: "2024-01-01",
            commentsCount: 5,
          },
          {
            postId: 2,
            postTitle: "Second Post",
            createdAt: "2024-01-02",
            commentsCount: 3,
          },
        ],
        followerCount: 100,
      };
      const result = toSnakeCase(input);
      expect(result).toEqual({
        user_id: 123,
        first_name: "John",
        last_name: "Doe",
        email_address: "john@example.com",
        user_settings: {
          notification_enabled: true,
          email_notifications: false,
          push_notifications: true,
        },
        recent_posts: [
          {
            post_id: 1,
            post_title: "First Post",
            created_at: "2024-01-01",
            comments_count: 5,
          },
          {
            post_id: 2,
            post_title: "Second Post",
            created_at: "2024-01-02",
            comments_count: 3,
          },
        ],
        follower_count: 100,
      });
    });
  });
});
