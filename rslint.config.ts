import {
  defineConfig,
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
  ts.configs.recommended,
  reactPlugin.configs.recommended,
  reactHooksPlugin.configs.recommended,
  jsxA11yPlugin.configs.recommended,
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
