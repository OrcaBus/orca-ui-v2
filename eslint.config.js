import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Global ignores (in addition to default node_modules, .git)
  globalIgnores([
    'dist',
    'build',
    'coverage',
    'src/api/types',
    'docs',
    '.agents',
    '.claude',
    '.cursor',
    '.github/skills',
  ]),

  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,

  // Allow unused args/vars prefixed with underscore
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Disable type-checked rules for plain JS files that have no tsconfig coverage
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },

  // Public scripts load in the browser as classic scripts (not the TS/React bundle)
  {
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
      },
    },
  },

  // Client app code runs in the browser.
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
  },

  // Tooling/config files run in Node.
  {
    files: ['*.{js,ts,mjs,cjs}', 'scripts/**/*.{js,ts,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  // Design-system guardrail: feature code should use the shared
  // components/ui primitives instead of raw form/button elements.
  // 'warn' for now (existing backlog) — see DESIGN.md → Implementation
  // Notes for the full rationale and scoping.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**', '**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            'Prefer the shared <Button> from @/components/ui/Button over a raw <button> (see DESIGN.md).',
        },
        {
          selector: "JSXOpeningElement[name.name='input']",
          message:
            'Prefer the shared <Input> from @/components/ui/Input over a raw <input> (see DESIGN.md).',
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message:
            'Prefer the shared <Select> from @/components/ui/Select over a raw <select> (see DESIGN.md).',
        },
      ],
    },
  },

  // Prettier - must be last to override conflicting rules
  eslintConfigPrettier,
]);
