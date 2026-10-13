import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignora pastas de build e dependências
  {
    ignores: ["build/**", "node_modules/**"],
  },

  // Importa regras recomendadas do JS e TypeScript
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Aplica globals do Node e regras customizadas
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-undef": "off",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
);
