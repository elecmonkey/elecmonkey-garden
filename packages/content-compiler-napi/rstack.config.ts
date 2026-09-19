// Configuration guide: https://rstack.rs/config
import { define } from 'rstack';

define.lib({
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
