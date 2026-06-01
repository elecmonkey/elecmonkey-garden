import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';
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

function createChildren(components: PageRouteComponents, locale: Locale): RouteObject[] {
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
    { index: true, element: <HomeRoute locale={locale} /> },
    { path: 'about', element: <AboutRoute locale={locale} /> },
    { path: 'blog', element: <BlogIndexRoute locale={locale} /> },
    { path: 'blog/page/:page', element: <BlogPaginationRoute locale={locale} /> },
    { path: 'blog/:slug', element: <BlogPostRoute locale={locale} /> },
    { path: 'tags', element: <TagsIndexRoute locale={locale} /> },
    { path: 'tags/:tag', element: <TagRoute locale={locale} /> },
    { path: 'tags/:tag/page/:page', element: <TagPaginationRoute locale={locale} /> },
    { path: 'archive', element: <ArchiveIndexRoute locale={locale} /> },
    { path: 'archive/:month', element: <MonthArchiveRoute locale={locale} /> },
    { path: 'archive/:month/page/:page', element: <MonthArchivePaginationRoute locale={locale} /> },
    { path: 'search', element: <SearchRoute locale={locale} /> },
    { path: '*', element: <NotFoundRoute locale={locale} /> },
  ];
}

export function createRoutes(components: PageRouteComponents): RouteObject[] {
  return [
    {
      path: '/',
      element: <RootLayout locale="zh" />,
      children: createChildren(components, 'zh'),
    },
    {
      path: '/en',
      element: <RootLayout locale="en" />,
      children: createChildren(components, 'en'),
    },
  ];
}
