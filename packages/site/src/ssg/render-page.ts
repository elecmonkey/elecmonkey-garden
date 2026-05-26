import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { render } from '../entry.ssg';
import { renderMetadataTags } from './metadata';

export const rootMarker = '<div id="root"></div>';

function normalizePathname(pathname: string): string {
  if (!pathname.startsWith('/')) {
    return `/${pathname}`;
  }
  return pathname;
}

export function getHtmlOutputPath(distDir: string, pathname: string): string {
  const normalized = normalizePathname(pathname).replace(/\/+$/, '') || '/';

  if (normalized === '/') {
    return path.join(distDir, 'index.html');
  }

  return path.join(distDir, normalized.slice(1), 'index.html');
}

export async function renderStaticPage(template: string, pathname: string): Promise<string> {
  const appHtml = render(pathname);
  const metadataTags = await renderMetadataTags(pathname);

  return template
    .replace(/<title>.*?<\/title>/, metadataTags)
    .replace(rootMarker, `<div id="root">${appHtml}</div>`);
}

export async function writeStaticPage(distDir: string, template: string, pathname: string): Promise<void> {
  const html = await renderStaticPage(template, pathname);
  const outputPath = getHtmlOutputPath(distDir, pathname);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}
