// Configuration guide: https://rstack.rs/config
import { define } from 'rstack';

define.lint(
  ({ globals, js, ts, reactPlugin, reactHooksPlugin, jsxA11yPlugin }) => [
    {
      ignores: ['**/src/generated/**'],
    },
    js.configs.recommended,
    ts.configs.recommendedTypeChecked,
    reactPlugin.configs.recommended,
    reactHooksPlugin.configs.recommended,
    jsxA11yPlugin.configs.recommended,
    {
      files: ['packages/site/src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      ignores: ['packages/site/src/ssg/**', 'packages/site/src/entry.ssg.tsx'],
      languageOptions: {
        globals: globals.browser,
      },
    },
    {
      files: [
        '*.config.{js,mjs,cjs,ts,mts,cts}',
        'packages/**/*.config.{js,mjs,cjs,ts,mts,cts}',
        'packages/content-compiler-napi/**/*.{js,mjs,cjs,ts,mts,cts}',
        'packages/og-generator/**/*.{js,mjs,cjs,ts,mts,cts}',
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
          projectService: true,
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
  ],
);

define.fmt({
  singleQuote: true,
  sortPackageJson: true,
  ignorePatterns: ['content/**', 'packages/site/src/generated/**'],
});
