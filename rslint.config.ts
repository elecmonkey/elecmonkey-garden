import {
  defineConfig,
  globals,
  js,
  ts,
  reactPlugin,
  reactHooksPlugin,
  jsxA11yPlugin,
} from '@rslint/core';

export default defineConfig([
  {
    ignores: [
      '**/dist/**',
      '**/.rsbuild/**',
      '**/.garden-cache/**',
      '**/artifacts/**',
      '**/npm/**',
      '**/src/generated/**',
      '**/*.node',
      '**/native.d.ts',
    ],
  },
  js.configs.recommended,
  ts.configs.recommendedTypeChecked,
  reactPlugin.configs.recommended,
  reactHooksPlugin.configs.recommended,
  jsxA11yPlugin.configs.recommended,
  {
    files: ['packages/site/src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    ignores: [
      'packages/site/src/ssg/**',
      'packages/site/src/entry.ssg.tsx',
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: [
      '*.config.{js,mjs,cjs,ts,mts,cts}',
      'packages/**/*.config.{js,mjs,cjs,ts,mts,cts}',
      'packages/content-compiler-napi/**/*.{js,mjs,cjs,ts,mts,cts}',
      'packages/site/src/entry.ssg.tsx',
      'packages/site/src/ssg/**/*.{js,mjs,cjs,ts,mts,cts}',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: [
      'packages/site/src/app/archive/**/*.tsx',
      'packages/site/src/app/blog/**/*.tsx',
      'packages/site/src/app/tags/**/*.tsx',
    ],
    rules: {
      // React Router uses thrown Response objects for HTTP control flow.
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [
          './packages/site/tsconfig.json',
          './packages/content-compiler-napi/tsconfig.json',
        ],
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'jsx-a11y/anchor-has-content': 'off',
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-tabindex': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
    },
  },
]);
