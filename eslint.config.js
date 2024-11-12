import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 6,
      sourceType: "module",
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "no-var": "error",
      "semi": ["error", "always"],
      "prefer-const": "error",
      "camelcase": "error",
      "space-before-function-paren": ["error", {
        "anonymous": "always",
        "named": "never",
        "asyncArrow": "always"
      }]
    }
  }
];
