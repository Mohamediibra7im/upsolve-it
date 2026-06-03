import nextConfig from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const eslintConfig = [
  {
    ignores: [
      "components/ui/**",
      "lib/utils.ts",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts"
    ]
  },
  ...nextConfig,
  ...nextCoreWebVitals,
  prettierConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    }
  },
  {
    settings: {
      react: {
        version: "19.2.5"
      }
    },
    rules: {
      "indent": "off",
      "linebreak-style": ["off"],
      "semi": "off",
      "no-console": 0,
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;
