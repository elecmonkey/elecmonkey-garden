import { availableParallelism } from 'node:os';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { getStaticPathnames } from '../app-shell/static-paths';
import { getAllMonths, getAllPostIds, getAllTags, getPostById } from '../lib/api';
import { getTagPath } from '../lib/tag-url';
import { rootMarker, writeStaticPage } from './render-page';

type RenderWorkerData = {
  distDir: string;
  template: string;
  pathnames: string[];
};

function getWorkerCount(pathnameCount: number): number {
  const rawWorkerCount = process.env.SSG_WORKERS;

  if (!rawWorkerCount) {
    return 1;
  }

  if (rawWorkerCount === 'auto') {
    const cpuCount = availableParallelism();
    return Math.max(1, Math.min(cpuCount, Math.floor(pathnameCount / 128)));
  }

  const workerCount = Number.parseInt(rawWorkerCount, 10);

  if (!Number.isFinite(workerCount) || workerCount <= 1) {
    return 1;
  }

  return Math.min(workerCount, pathnameCount);
}

function splitIntoChunks<T>(items: T[], chunkCount: number): T[][] {
  const chunks = Array.from({ length: chunkCount }, () => [] as T[]);

  items.forEach((item, index) => {
    chunks[index % chunkCount].push(item);
  });

  return chunks.filter((chunk) => chunk.length > 0);
}

async function renderStaticPagesInWorkers(
  distDir: string,
  template: string,
  pathnames: string[],
  workerCount: number,
): Promise<void> {
  const chunks = splitIntoChunks(pathnames, workerCount);
  const workerUrl = pathToFileURL(process.argv[1]);

  await Promise.all(chunks.map((chunk) => new Promise<void>((resolve, reject) => {
    const worker = new Worker(workerUrl, {
      workerData: {
        distDir,
        template,
        pathnames: chunk,
      },
    });

    worker.once('message', (message: { ok: boolean; error?: string }) => {
      if (!message.ok) {
        reject(new Error(message.error ?? 'SSG worker failed.'));
      }
    });
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`SSG worker stopped with exit code ${code}.`));
      }
    });
  })));
}

async function renderStaticPages(distDir: string, template: string, pathnames: string[]): Promise<number> {
  const workerCount = getWorkerCount(pathnames.length);

  if (workerCount <= 1) {
    await Promise.all(pathnames.map((pathname) => writeStaticPage(distDir, template, pathname)));
    return 1;
  }

  await renderStaticPagesInWorkers(distDir, template, pathnames, workerCount);
  return workerCount;
}

async function runRenderWorker(): Promise<void> {
  const { distDir, template, pathnames } = workerData as RenderWorkerData;

  for (const pathname of pathnames) {
    await writeStaticPage(distDir, template, pathname);
  }
}

async function copyStaticAssets(distDir: string): Promise<void> {
  const searchDir = path.join(distDir, 'static', 'search');
  await mkdir(searchDir, { recursive: true });
  await copyFile(path.join('src', 'generated', 'search-index.json'), path.join(searchDir, 'index.json'));
}

async function writeRobotsTxt(distDir: string): Promise<void> {
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /search',
    'Disallow: /api/',
    '',
    'Sitemap: https://www.elecmonkey.com/sitemap.xml',
    '',
  ].join('\n');

  await writeFile(path.join(distDir, 'robots.txt'), robots);
}

type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
};

function escapeXml(value: string): string {
  return value.replace(/[&<>\"']/g, (char) => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '\"': return '&quot;';
      default: return '&apos;';
    }
  });
}

async function writeSitemapXml(distDir: string): Promise<void> {
  const baseUrl = 'https://www.elecmonkey.com';
  const now = new Date();

  const postEntries = getAllPostIds()
    .map((postId): SitemapEntry | null => {
      const post = getPostById(postId.params.slug);

      if (post.isHidden) {
        return null;
      }

      return {
        url: `${baseUrl}/blog/${postId.params.slug}`,
        lastModified: post.date ? new Date(post.date) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      };
    })
    .filter((entry): entry is SitemapEntry => entry !== null);

  const tagEntries = getAllTags().map((tag): SitemapEntry => ({
    url: `${baseUrl}${getTagPath(tag.name)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  const monthEntries = getAllMonths().map((month): SitemapEntry => ({
    url: `${baseUrl}/archive/${month.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  const staticEntries: SitemapEntry[] = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/tags`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/archive`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];

  const entries = [...staticEntries, ...postEntries, ...tagEntries, ...monthEntries];
  const urls = entries.map((entry) => [
    '  <url>',
    `    <loc>${escapeXml(entry.url)}</loc>`,
    `    <lastmod>${entry.lastModified.toISOString()}</lastmod>`,
    `    <changefreq>${entry.changeFrequency}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>',
  ].join('\n')).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  await writeFile(path.join(distDir, 'sitemap.xml'), sitemap);
}

export async function buildStaticSite(): Promise<void> {
  const distDir = path.resolve('dist');
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8');

  if (!template.includes(rootMarker)) {
    throw new Error('Unable to find root element in Rsbuild HTML template.');
  }

  const pathnames = await getStaticPathnames();
  const workerCount = await renderStaticPages(distDir, template, pathnames);

  await copyStaticAssets(distDir);
  await Promise.all([writeRobotsTxt(distDir), writeSitemapXml(distDir)]);

  console.log(`generated ${pathnames.length} static pages with ${workerCount} SSG worker${workerCount > 1 ? 's' : ''}`);
}

if (isMainThread) {
  await buildStaticSite();
} else {
  try {
    await runRenderWorker();
    parentPort?.postMessage({ ok: true });
  } catch (error) {
    parentPort?.postMessage({
      ok: false,
      error: error instanceof Error ? error.stack ?? error.message : String(error),
    });
    throw error;
  }
}
