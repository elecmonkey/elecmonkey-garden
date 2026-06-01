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

async function addLocaleStaticPathnames(paths: Set<string>, locale: Locale): Promise<void> {
  for (const pathname of ['/', '/about', '/blog', '/tags', '/archive', '/search']) {
    paths.add(hrefFor(locale, pathname));
  }

  const [{ totalPages: blogTotalPages }, postIds, tags, months] = await Promise.all([
    getAllPostsWithPagination(locale, 1),
    getAllPostIds(locale),
    getAllTags(locale),
    getAllMonths(locale),
  ]);

  for (let page = 2; page <= blogTotalPages; page++) {
    paths.add(hrefFor(locale, `/blog/page/${page}`));
  }

  for (const post of postIds) {
    paths.add(hrefFor(locale, `/blog/${post.params.slug}`));
  }

  await Promise.all(
    tags.map(async (tag) => {
      const tagSlug = encodeTagToSlug(tag.name);
      paths.add(hrefFor(locale, `/tags/${tagSlug}`));

      const { totalPages } = await getPostsByTagWithPagination(locale, tag.name, 1);
      for (let page = 2; page <= totalPages; page++) {
        paths.add(hrefFor(locale, `/tags/${tagSlug}/page/${page}`));
      }
    }),
  );

  await Promise.all(
    months.map(async (month) => {
      paths.add(hrefFor(locale, `/archive/${month.id}`));

      const { totalPages } = await getPostsByMonthWithPagination(locale, month.id, 1);
      for (let page = 2; page <= totalPages; page++) {
        paths.add(hrefFor(locale, `/archive/${month.id}/page/${page}`));
      }
    }),
  );
}

export async function getStaticPathnames(): Promise<string[]> {
  const paths = new Set<string>();

  await Promise.all(locales.map((locale) => addLocaleStaticPathnames(paths, locale)));

  return Array.from(paths).map(normalizePathname).sort();
}
