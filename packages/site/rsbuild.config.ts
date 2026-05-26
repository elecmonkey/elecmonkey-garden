import { readFile } from 'node:fs/promises';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

export default defineConfig({
  plugins: [pluginReact(), pluginTailwindcss()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  server: {
    port: 3710,
    setup({ action, server }) {
      if (action !== 'dev') {
        return;
      }

      server.middlewares.use('/static/search/index.json', async (_req, res) => {
        try {
          const searchIndex = await readFile('src/generated/search-index.json');
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(searchIndex);
        } catch {
          res.statusCode = 404;
          res.end('Search index is not generated. Run `pnpm content` first.');
        }
      });
    },
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
