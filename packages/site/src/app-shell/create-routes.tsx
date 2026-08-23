import type { ComponentType } from 'react';
import type { LoaderFunction, RouteObject } from 'react-router';
import type { Locale } from '@/lib/i18n';
import { RootLayout } from './RootLayout';

type PageRouteComponents = {
  HomeRoute: ComponentType<{ locale: Locale }>;
  AboutRoute: ComponentType<{ locale: Locale }>;
  BlogIndexRoute: ComponentType<{ locale: Locale }>;
  BlogPaginationRoute: ComponentType<{ locale: Locale }>;
  BlogPostRoute: ComponentType<{ locale: Locale }>;
  TagsIndexRoute: ComponentType<{ locale: Locale }>;
  TagRoute: ComponentType<{ locale: Locale }>;
  TagPaginationRoute: ComponentType<{ locale: Locale }>;
  ArchiveIndexRoute: ComponentType<{ locale: Locale }>;
  MonthArchiveRoute: ComponentType<{ locale: Locale }>;
  MonthArchivePaginationRoute: ComponentType<{ locale: Locale }>;
  SearchRoute: ComponentType<{ locale: Locale }>;
  NotFoundRoute: ComponentType<{ locale: Locale }>;
};

type PageRouteKey =
  | 'home'
  | 'about'
  | 'blog'
  | 'blogPagination'
  | 'blogPost'
  | 'tags'
  | 'tag'
  | 'tagPagination'
  | 'archive'
  | 'monthArchive'
  | 'monthArchivePagination'
  | 'search'
  | 'notFound';

export type PageRouteLoaders = Record<PageRouteKey, LoaderFunction>;

function createChildren(
  components: PageRouteComponents,
  locale: Locale,
  loaders: Partial<PageRouteLoaders> = {},
): RouteObject[] {
  const {
    HomeRoute,
    AboutRoute,
    BlogIndexRoute,
    BlogPaginationRoute,
    BlogPostRoute,
    TagsIndexRoute,
    TagRoute,
    TagPaginationRoute,
    ArchiveIndexRoute,
    MonthArchiveRoute,
    MonthArchivePaginationRoute,
    SearchRoute,
    NotFoundRoute,
  } = components;

  return [
    { id: `${locale}-home`, index: true, loader: loaders.home, element: <HomeRoute locale={locale} /> },
    { id: `${locale}-about`, path: 'about', loader: loaders.about, element: <AboutRoute locale={locale} /> },
    { id: `${locale}-blog`, path: 'blog', loader: loaders.blog, element: <BlogIndexRoute locale={locale} /> },
    {
      id: `${locale}-blog-pagination`,
      path: 'blog/page/:page',
      loader: loaders.blogPagination,
      element: <BlogPaginationRoute locale={locale} />,
    },
    {
      id: `${locale}-blog-post`,
      path: 'blog/:slug',
      loader: loaders.blogPost,
      element: <BlogPostRoute locale={locale} />,
    },
    { id: `${locale}-tags`, path: 'tags', loader: loaders.tags, element: <TagsIndexRoute locale={locale} /> },
    { id: `${locale}-tag`, path: 'tags/:tag', loader: loaders.tag, element: <TagRoute locale={locale} /> },
    {
      id: `${locale}-tag-pagination`,
      path: 'tags/:tag/page/:page',
      loader: loaders.tagPagination,
      element: <TagPaginationRoute locale={locale} />,
    },
    {
      id: `${locale}-archive`,
      path: 'archive',
      loader: loaders.archive,
      element: <ArchiveIndexRoute locale={locale} />,
    },
    {
      id: `${locale}-month-archive`,
      path: 'archive/:month',
      loader: loaders.monthArchive,
      element: <MonthArchiveRoute locale={locale} />,
    },
    {
      id: `${locale}-month-archive-pagination`,
      path: 'archive/:month/page/:page',
      loader: loaders.monthArchivePagination,
      element: <MonthArchivePaginationRoute locale={locale} />,
    },
    { id: `${locale}-search`, path: 'search', loader: loaders.search, element: <SearchRoute locale={locale} /> },
    { id: `${locale}-not-found`, path: '*', loader: loaders.notFound, element: <NotFoundRoute locale={locale} /> },
  ];
}

export function createRoutes(components: PageRouteComponents, loaders: Partial<PageRouteLoaders> = {}): RouteObject[] {
  return [
    {
      id: 'zh-root',
      path: '/',
      element: <RootLayout locale="zh" />,
      children: createChildren(components, 'zh', loaders),
    },
    {
      id: 'en-root',
      path: '/en',
      element: <RootLayout locale="en" />,
      children: createChildren(components, 'en', loaders),
    },
  ];
}
