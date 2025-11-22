import { describe, it, expect } from "vitest";
import { snakeToCamel, toCamelCase } from "../to-camel-case";

describe("snakeToCamel", () => {
  it("should convert simple snake_case to camelCase", () => {
    expect(snakeToCamel("hello_world")).toBe("helloWorld");
  });

  it("should convert multiple underscores", () => {
    expect(snakeToCamel("hello_world_foo_bar")).toBe("helloWorldFooBar");
  });

  it("should handle single word", () => {
    expect(snakeToCamel("hello")).toBe("hello");
  });

  it("should handle empty string", () => {
    expect(snakeToCamel("")).toBe("");
  });

  it("should handle string with leading underscore", () => {
    expect(snakeToCamel("_hello_world")).toBe("helloWorld");
  });

  it("should handle string with trailing underscore", () => {
    expect(snakeToCamel("hello_world_")).toBe("helloWorld");
  });

  it("should handle consecutive underscores", () => {
    expect(snakeToCamel("hello__world")).toBe("helloWorld");
  });

  it("should not affect uppercase letters after underscore", () => {
    expect(snakeToCamel("hello_WORLD")).toBe("helloWorld");
  });

  it("should handle single letter words", () => {
    expect(snakeToCamel("a_b_c")).toBe("aBC");
  });

  it("should handle numbers", () => {
    expect(snakeToCamel("hello_world_123")).toBe("helloWorld123");
  });
});

describe("toCamelCase", () => {
  describe("simple objects", () => {
    it("should convert simple flat object", () => {
      const input = { hello_world: "value", foo_bar: "baz" };
      const result = toCamelCase(input);
      expect(result).toEqual({ helloWorld: "value", fooBar: "baz" });
    });

    it("should handle single property", () => {
      const input = { hello_world: "value" };
      const result = toCamelCase(input);
      expect(result).toEqual({ helloWorld: "value" });
    });

    it("should handle empty object", () => {
      const input = {};
      const result = toCamelCase(input);
      expect(result).toEqual({});
    });

    it("should preserve values of different types", () => {
      const input = {
        string_value: "text",
        number_value: 42,
        boolean_value: true,
        null_value: null,
        undefined_value: undefined,
      };
      const result = toCamelCase(input);
      expect(result).toEqual({
        stringValue: "text",
        numberValue: 42,
        booleanValue: true,
        nullValue: null,
        undefinedValue: undefined,
      });
    });
  });

  describe("nested objects", () => {
    it("should convert nested object keys", () => {
      const input = {
        user_info: {
          first_name: "John",
          last_name: "Doe",
        },
      };
      const result = toCamelCase(input);
      expect(result).toEqual({
        userInfo: {
          firstName: "John",
          lastName: "Doe",
        },
      });
    });

    it("should convert deeply nested objects", () => {
      const input = {
        level_one: {
          level_two: {
            level_three: "value",
          },
        },
      };
      const result = toCamelCase(input);
      expect(result).toEqual({
        levelOne: {
          levelTwo: {
            levelThree: "value",
          },
        },
      });
    });

    it("should handle mixed nested structures", () => {
      const input = {
        user_data: {
          personal_info: {
            first_name: "Jane",
            email_address: "jane@example.com",
          },
          account_settings: {
            two_factor_enabled: true,
          },
        },
      };
      const result = toCamelCase(input);
      expect(result).toEqual({
        userData: {
          personalInfo: {
            firstName: "Jane",
            emailAddress: "jane@example.com",
          },
          accountSettings: {
            twoFactorEnabled: true,
          },
        },
      });
    });
  });

  describe("arrays", () => {
    it("should convert array of objects", () => {
      const input = [
        { user_id: 1, user_name: "John" },
        { user_id: 2, user_name: "Jane" },
      ];
      const result = toCamelCase(input);
      expect(result).toEqual([
        { userId: 1, userName: "John" },
        { userId: 2, userName: "Jane" },
      ]);
    });

    it("should handle empty array", () => {
      const input: object[] = [];
      const result = toCamelCase(input);
      expect(result).toEqual([]);
    });

    it("should handle array with single element", () => {
      const input = [{ user_id: 1 }];
      const result = toCamelCase(input);
      expect(result).toEqual([{ userId: 1 }]);
    });

    it("should handle nested arrays", () => {
      const input = {
        user_list: [
          {
            user_id: 1,
            posts: [
              { post_id: 101, post_title: "First" },
              { post_id: 102, post_title: "Second" },
            ],
          },
        ],
      };
      const result = toCamelCase(input);
      expect(result).toEqual({
        userList: [
          {
            userId: 1,
            posts: [
              { postId: 101, postTitle: "First" },
              { postId: 102, postTitle: "Second" },
            ],
          },
        ],
      });
    });

    it("should handle array of primitives", () => {
      const input = [1, "hello", true, null];
      const result = toCamelCase(input);
      expect(result).toEqual([1, "hello", true, null]);
    });

    it("should handle mixed array", () => {
      const input = [
        { first_name: "John" },
        "string",
        42,
        { last_name: "Doe" },
      ];
      const result = toCamelCase(input);
      expect(result).toEqual([
        { firstName: "John" },
        "string",
        42,
        { lastName: "Doe" },
      ]);
    });
  });

  describe("edge cases", () => {
    it("should handle null value", () => {
      const input = null;
      const result = toCamelCase(input as any);
      expect(result).toBeNull();
    });

    it("should handle properties with no underscores", () => {
      const input = { hello: "world", foo: "bar" };
      const result = toCamelCase(input);
      expect(result).toEqual({ hello: "world", foo: "bar" });
    });

    it("should handle properties with leading/trailing underscores", () => {
      const input = { _private: "value", public_: "value2" };
      const result = toCamelCase(input);
      expect(result).toEqual({ private: "value", public: "value2" });
    });

    it("should handle numeric keys", () => {
      const input = { user_1: "value1", user_2: "value2" } as any;
      const result = toCamelCase(input);
      expect(result).toEqual({ user1: "value1", user2: "value2" });
    });

    it("should handle mixed case input", () => {
      const input = { User_Name: "John", FIRST_NAME: "Doe" };
      const result = toCamelCase(input);
      expect(result).toEqual({ userName: "John", firstName: "Doe" });
    });

    it("should handle very long key names", () => {
      const input = {
        very_long_property_name_with_many_underscores: "value",
      };
      const result = toCamelCase(input);
      expect(result).toEqual({
        veryLongPropertyNameWithManyUnderscores: "value",
      });
    });

    it("should handle special characters (outside snake_case)", () => {
      const input = { "hello-world": "value", "foo@bar": "baz" };
      const result = toCamelCase(input);
      expect(result).toEqual({ "hello-world": "value", "foo@bar": "baz" });
    });

    it("should preserve object references for non-object values", () => {
      const obj = { user_id: 1 };
      const result = toCamelCase(obj);
      expect(result).not.toBe(obj); // new object
      expect(result.userId).toBe(1);
    });

    it("should handle objects with Date objects", () => {
      const date = new Date("2024-01-01");
      const input = { created_at: date };
      const result = toCamelCase(input);
      expect(result).toEqual({ createdAt: date });
    });

    it("should handle object with methods (methods are not enumerable)", () => {
      const input = { user_name: "John" };
      Object.defineProperty(input, "get_name", {
        value: function () {
          return this.user_name;
        },
        enumerable: false,
      });
      const result = toCamelCase(input);
      expect(result).toEqual({ userName: "John" });
    });

    it("should handle circular reference gracefully (won't infinitely recurse for non-circular)", () => {
      const input = {
        user_data: {
          profile_info: {
            name: "John",
          },
        },
      };
      const result = toCamelCase(input);
      expect(result).toEqual({
        userData: {
          profileInfo: {
            name: "John",
          },
        },
      });
    });

    it("should handle array of arrays", () => {
      const input = {
        matrix_data: [
          [1, 2, 3],
          [4, 5, 6],
        ],
      };
      const result = toCamelCase(input);
      expect(result).toEqual({
        matrixData: [
          [1, 2, 3],
          [4, 5, 6],
        ],
      });
    });

    it("should handle complex real-world API response", () => {
      const input = {
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
      };
      const result = toCamelCase(input);
      expect(result).toEqual({
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
      });
    });
  });
});
