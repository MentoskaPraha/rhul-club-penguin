import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/dist/**", "**/node_modules/**"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["src/client/**/*.ts"],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ["src/server/**/*.ts"],
    languageOptions: { globals: globals.node }
  },
  prettier
]);
