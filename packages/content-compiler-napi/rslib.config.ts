import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
      source: {
        entry: {
          index: './src-js/index.ts',
        },
      },
      output: {
        target: 'node',
        distPath: {
          root: 'dist',
        },
        cleanDistPath: true,
      },
      dts: {
        tsgo: true,
      },
    },
  ],
});
