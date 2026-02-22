// ESLint 9 flat config — no FlatCompat to avoid eslint-plugin-react circular ref issues.
// Manually composes the same rules as next/core-web-vitals + TypeScript support.
import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import hooksPlugin from 'eslint-plugin-react-hooks';

export default [
  // ── TypeScript files ─────────────────────────────────────────────────
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@next/next': nextPlugin,
      'react-hooks': hooksPlugin,
    },
    rules: {
      // Next.js core-web-vitals rules
      ...nextPlugin.configs['core-web-vitals'].rules,

      // React Hooks rules (rules-of-hooks + exhaustive-deps only)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,

      // Project overrides
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // False positive in App Router — fonts in layout.tsx are correct (not individual pages)
      '@next/next/no-page-custom-font': 'off',
    },
  },
  // ── Ignore patterns ───────────────────────────────────────────────────
  {
    ignores: ['.next/**', 'node_modules/**', 'prisma/**'],
  },
];
