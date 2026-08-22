import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Base JS rules
  js.configs.recommended,

  // TypeScript rules for all TS/TSX source files
  {
    files: ["packages/*/src/**/*.{ts,tsx}", "packages/*/__tests__/**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Allow explicit `any` in test files and adapter response parsers
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused vars — leading underscore suppresses
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  // React-specific rules for the react package
  {
    files: ["packages/react/src/**/*.{ts,tsx}", "packages/react/__tests__/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: { react: { version: "18" } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
  },

  // Node scripts in examples/
  {
    files: ["examples/**/*.{js,ts,mjs}"],
    languageOptions: { globals: globals.node },
  },

  // Global ignores
  {
    ignores: ["**/dist/**", "**/node_modules/**", "pnpm-lock.yaml"],
  },
);
