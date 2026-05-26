import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

function runContentGenerator() {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('pnpm', ['run', 'content'], {
      cwd: process.cwd(),
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`content generation failed with exit code ${code ?? 'unknown'}`));
    });
  });
}

function setupContentWatcher() {
  const postsDirectory = path.join(process.cwd(), 'src/content/posts');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let pending = false;

  const rerun = () => {
    if (running) {
      pending = true;
      return;
    }

    running = true;
    void runContentGenerator()
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        running = false;
        if (pending) {
          pending = false;
          rerun();
        }
      });
  };

  const watcher = watch(postsDirectory, { recursive: true }, (_eventType, fileName) => {
    if (!fileName || !fileName.endsWith('.md')) {
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(rerun, 80);
  });

  watcher.on('error', (error) => {
    console.error(error);
  });
}

export default defineConfig({
  plugins: [pluginReact(), pluginTailwindcss()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  server: {
    port: 3710,
    async setup({ action, server }) {
      if (action !== 'dev') {
        return;
      }

      await runContentGenerator();
      setupContentWatcher();

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
