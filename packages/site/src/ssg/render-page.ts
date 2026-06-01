import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadPostById, type PostData } from '../lib/api';
import { getLocaleFromPathname, stripLocalePrefix } from '../lib/i18n';
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

function getBlogPostSlug(pathname: string): string | undefined {
  const segments = stripLocalePrefix(pathname).replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (segments[0] === 'blog' && segments[1] && segments.length === 2) {
    return segments[1];
  }

  return undefined;
}

function serializeJsonForHtml(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

async function loadInitialPost(pathname: string): Promise<PostData | undefined> {
  const locale = getLocaleFromPathname(pathname);
  const slug = getBlogPostSlug(pathname);
  if (!slug) {
    return undefined;
  }

  return loadPostById(locale, slug);
}

function injectInitialPost(html: string, post: PostData | undefined): string {
  if (!post) {
    return html;
  }

  const script = `<script id="__garden_initial_post__" type="application/json">${serializeJsonForHtml(post)}</script>`;
  return html.replace('</body>', `${script}</body>`);
}

export async function renderStaticPage(template: string, pathname: string): Promise<string> {
  const locale = getLocaleFromPathname(pathname);
  const initialPost = await loadInitialPost(pathname);
  const appHtml = render(pathname);
  const metadataTags = await renderMetadataTags(pathname);

  return injectInitialPost(template
    .replace(/<html\s+lang="[^"]*"/, `<html lang="${locale === 'en' ? 'en' : 'zh-CN'}"`)
    .replace(/<title>.*?<\/title>/, metadataTags)
    .replace(rootMarker, `<div id="root">${appHtml}</div>`), initialPost);
}

export async function writeStaticPage(distDir: string, template: string, pathname: string): Promise<void> {
  const html = await renderStaticPage(template, pathname);
  const outputPath = getHtmlOutputPath(distDir, pathname);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}
