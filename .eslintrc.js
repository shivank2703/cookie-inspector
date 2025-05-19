module.exports = {
    env: {
      browser: true,   // your code runs in the browser
      es2021: true,    // enable modern JS globals
      node: true       // for tooling scripts (Webpack, tests)
    },
    extends: [
      "eslint:recommended",            // core ESLint rules
      "plugin:react/recommended",      // React-specific linting
      "prettier"                       // disables ESLint rules that conflict with Prettier
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true                      // enable JSX parsing
      },
      ecmaVersion: 12,                 // allow ES2021 syntax
      sourceType: "module"             // you’re using import/export
    },
    settings: {
      react: {
        version: "detect"              // automatically detect your React version
      }
    },
    rules: {
      // You can customize or disable rules here, e.g.:
      // "react/prop-types": "off"
    }
  };