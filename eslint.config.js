const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({
  baseDirectory: __dirname, // Ensure the base directory is set correctly
});

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: true,
        es2021: true,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Add your custom rules here
    },
  },
  ...compat.extends('eslint:recommended', 'plugin:react/recommended'),
];