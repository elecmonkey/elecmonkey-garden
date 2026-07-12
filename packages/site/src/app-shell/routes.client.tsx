import type { LoaderFunctionArgs } from 'react-router';
import { getLocaleFromPathname } from '@/lib/i18n';
import { createRoutes, type PageRouteLoaders } from './create-routes';
import * as pageRoutes from './PageRoutes.client';

function waitForRoute(preload: () => Promise<unknown>) {
  return async () => {
    await preload();
    return null;
  };
}

async function waitForBlogPost({ params, request }: LoaderFunctionArgs) {
  const slug = params.slug;

  await Promise.all([
    pageRoutes.clientRouteLoaders.blogPost(),
    slug
      ? import('@/lib/api').then(async ({ prefetchPostById }) => {
          try {
            await prefetchPostById(getLocaleFromPathname(new URL(request.url).pathname), slug);
          } catch {
            // Keep the page's existing not-found and load-error handling in control.
          }
        })
      : Promise.resolve(),
  ]);

  return null;
}

async function waitForSearch({ request }: LoaderFunctionArgs) {
  await pageRoutes.clientRouteLoaders.search();

  const url = new URL(request.url);
  if (!url.searchParams.get('keyword')?.trim()) {
    return null;
  }

  try {
    const { prefetchSearchIndexPosts } = await import('@/lib/search');
    await prefetchSearchIndexPosts(getLocaleFromPathname(url.pathname));
  } catch {
    // The search page owns its retry and error UI.
  }

  return null;
}

const loaders = {
  home: waitForRoute(pageRoutes.clientRouteLoaders.home),
  about: waitForRoute(pageRoutes.clientRouteLoaders.about),
  blog: waitForRoute(pageRoutes.clientRouteLoaders.blog),
  blogPagination: waitForRoute(pageRoutes.clientRouteLoaders.blogPagination),
  blogPost: waitForBlogPost,
  tags: waitForRoute(pageRoutes.clientRouteLoaders.tags),
  tag: waitForRoute(pageRoutes.clientRouteLoaders.tag),
  tagPagination: waitForRoute(pageRoutes.clientRouteLoaders.tagPagination),
  archive: waitForRoute(pageRoutes.clientRouteLoaders.archive),
  monthArchive: waitForRoute(pageRoutes.clientRouteLoaders.monthArchive),
  monthArchivePagination: waitForRoute(pageRoutes.clientRouteLoaders.monthArchivePagination),
  search: waitForSearch,
  notFound: waitForRoute(pageRoutes.clientRouteLoaders.notFound),
} satisfies PageRouteLoaders;

export const routes = createRoutes(pageRoutes, loaders);
