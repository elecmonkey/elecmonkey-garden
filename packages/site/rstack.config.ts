// Configuration guide: https://rstack.rs/config
import { gardenContentPlugin } from '@elecmonkey/garden-content-compiler';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { define } from 'rstack';

define.app({
  plugins: [
    gardenContentPlugin({
      locales: {
        zh: {
          postsDirectory: '../../content/posts',
          urlPrefix: '',
        },
        en: {
          postsDirectory: '../../content/en/posts',
          urlPrefix: '/en',
        },
      },
    }),
    pluginReact(),
    pluginTailwindcss(),
  ],
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
        copy: [
          {
            from: '**/*.og.jpg',
            context: '../../content/posts',
            to: 'og/zh/[name][ext]',
            noErrorOnMissing: true,
          },
          {
            from: '**/*.og.jpg',
            context: '../../content/en/posts',
            to: 'og/en/[name][ext]',
            noErrorOnMissing: true,
          },
        ],
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
