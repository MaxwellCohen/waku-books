import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**', 'src/pages.gen.ts'],
  },
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['src/lib/db/**'],
    rules: { 'no-console': 'off' },
  },
]);
