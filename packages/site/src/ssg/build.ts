import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { render } from '../entry.ssg';
import { getStaticPathnames } from '../app-shell/static-paths';
import { renderMetadataTags } from './metadata';
import { getAllMonths, getAllPostIds, getAllTags, getPostById } from '../lib/api';
import { getTagPath } from '../lib/tag-url';

const rootMarker = '<div id="root"></div>';

function normalizePathname(pathname: string): string {
  if (!pathname.startsWith('/')) {
    return `/${pathname}`;
  }
  return pathname;
}

function getHtmlOutputPath(distDir: string, pathname: string): string {
  const normalized = normalizePathname(pathname).replace(/\/+$/, '') || '/';

  if (normalized === '/') {
    return path.join(distDir, 'index.html');
  }

  return path.join(distDir, normalized.slice(1), 'index.html');
}

async function writeStaticPage(distDir: string, template: string, pathname: string): Promise<void> {
  const appHtml = render(pathname);
  const metadataTags = await renderMetadataTags(pathname);
  const html = template
    .replace(/<title>.*?<\/title>/, metadataTags)
    .replace(rootMarker, `<div id="root">${appHtml}</div>`);
  const outputPath = getHtmlOutputPath(distDir, pathname);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}

async function copyStaticAssets(distDir: string): Promise<void> {
  await copyFile(path.join('src', 'app', 'icon.png'), path.join(distDir, 'icon.png'));

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

  await Promise.all(pathnames.map((pathname) => writeStaticPage(distDir, template, pathname)));
  await copyStaticAssets(distDir);
  await Promise.all([writeRobotsTxt(distDir), writeSitemapXml(distDir)]);

  console.log(`generated ${pathnames.length} static pages`);
}

await buildStaticSite();
