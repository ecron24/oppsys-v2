import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/**"] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: __dirname,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
    },
  }
);
