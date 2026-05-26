import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { gardenContentPlugin } from '@elecmonkey/garden-content-compiler';

export default defineConfig({
  plugins: [gardenContentPlugin(), pluginReact(), pluginTailwindcss()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  server: {
    port: 3710,
  },
  environments: {
    web: {
      source: {
        entry: {
          index: './src/entry.client.tsx',
        },
      },
      html: {
        template: './src/index.html',
      },
      output: {
        target: 'web',
        distPath: {
          root: 'dist',
        },
        manifest: {
          filename: 'asset-manifest.json',
          prefix: false,
        },
      },
    },
    ssg: {
      source: {
        entry: {
          build: './src/ssg/build.ts',
        },
      },
      output: {
        target: 'node',
        autoExternal: true,
        distPath: {
          root: '.rsbuild/ssg',
        },
        manifest: {
          filename: 'ssg-manifest.json',
          prefix: false,
        },
      },
    },
  },
});
