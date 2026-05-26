import {
  getAllMonths,
  getAllPostIds,
  getAllPostsWithPagination,
  getAllTags,
  getPostsByMonthWithPagination,
  getPostsByTagWithPagination,
} from '@/lib/api';
import { encodeTagToSlug } from '@/lib/tag-url';

function normalizePathname(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

export async function getStaticPathnames(): Promise<string[]> {
  const paths = new Set<string>([
    '/',
    '/about',
    '/blog',
    '/tags',
    '/archive',
    '/search',
  ]);

  const [{ totalPages: blogTotalPages }, postIds, tags, months] = await Promise.all([
    getAllPostsWithPagination(1),
    getAllPostIds(),
    getAllTags(),
    getAllMonths(),
  ]);

  for (let page = 2; page <= blogTotalPages; page++) {
    paths.add(`/blog/page/${page}`);
  }

  for (const post of postIds) {
    paths.add(`/blog/${post.params.slug}`);
  }

  await Promise.all(
    tags.map(async (tag) => {
      const tagSlug = encodeTagToSlug(tag.name);
      paths.add(`/tags/${tagSlug}`);

      const { totalPages } = await getPostsByTagWithPagination(tag.name, 1);
      for (let page = 2; page <= totalPages; page++) {
        paths.add(`/tags/${tagSlug}/page/${page}`);
      }
    }),
  );

  await Promise.all(
    months.map(async (month) => {
      paths.add(`/archive/${month.id}`);

      const { totalPages } = await getPostsByMonthWithPagination(month.id, 1);
      for (let page = 2; page <= totalPages; page++) {
        paths.add(`/archive/${month.id}/page/${page}`);
      }
    }),
  );

  return Array.from(paths).map(normalizePathname).sort();
}

