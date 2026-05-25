import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { render } from '../entry.ssg';
import { getStaticPathnames } from '../app-shell/static-paths';
import { renderMetadataTags } from './metadata';

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

  console.log(`generated ${pathnames.length} static pages`);
}

await buildStaticSite();
