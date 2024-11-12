import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        "Event": false,
        "clearInterval": false,
        "document": false,
        "setInterval": false,
        "setTimeout": false,
        "XMLHttpRequest": false,
        "window": false
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
