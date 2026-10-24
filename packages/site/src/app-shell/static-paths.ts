import {
  getAllMonths,
  getAllPostIds,
  getAllPostsWithPagination,
  getAllTags,
  getPostsByMonthWithPagination,
  getPostsByTagWithPagination,
} from '@/lib/api';
import { type Locale, hrefFor, locales } from '@/lib/i18n';
import { encodeTagToSlug } from '@/lib/tag-url';

function normalizePathname(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

function addLocaleStaticPathnames(paths: Set<string>, locale: Locale): void {
  for (const pathname of [
    '/',
    '/about',
    '/blog',
    '/tags',
    '/archive',
    '/search',
  ]) {
    paths.add(hrefFor(locale, pathname));
  }

  const { totalPages: blogTotalPages } = getAllPostsWithPagination(locale, 1);
  const postIds = getAllPostIds(locale);
  const tags = getAllTags(locale);
  const months = getAllMonths(locale);

  for (let page = 2; page <= blogTotalPages; page++) {
    paths.add(hrefFor(locale, `/blog/page/${page}`));
  }

  for (const post of postIds) {
    paths.add(hrefFor(locale, `/blog/${post.params.slug}`));
  }

  for (const tag of tags) {
    const tagSlug = encodeTagToSlug(tag.name);
    paths.add(hrefFor(locale, `/tags/${tagSlug}`));

    const { totalPages } = getPostsByTagWithPagination(locale, tag.name, 1);
    for (let page = 2; page <= totalPages; page++) {
      paths.add(hrefFor(locale, `/tags/${tagSlug}/page/${page}`));
    }
  }

  for (const month of months) {
    paths.add(hrefFor(locale, `/archive/${month.id}`));

    const { totalPages } = getPostsByMonthWithPagination(locale, month.id, 1);
    for (let page = 2; page <= totalPages; page++) {
      paths.add(hrefFor(locale, `/archive/${month.id}/page/${page}`));
    }
  }
}

export function getStaticPathnames(): Promise<string[]> {
  const paths = new Set<string>();

  for (const locale of locales) {
    addLocaleStaticPathnames(paths, locale);
  }

  return Promise.resolve(Array.from(paths).map(normalizePathname).sort());
}
