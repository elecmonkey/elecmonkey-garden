import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

export default defineConfig({
  plugins: [pluginReact(), pluginTailwindcss()],
  source: {
    entry: {
      index: './src/entry.client.tsx',
    },
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
  html: {
    template: './src/index.html',
  },
  output: {
    distPath: {
      root: 'dist',
    },
    manifest: {
      filename: 'asset-manifest.json',
      prefix: false,
    },
  },
  server: {
    port: 3710,
  },
});
