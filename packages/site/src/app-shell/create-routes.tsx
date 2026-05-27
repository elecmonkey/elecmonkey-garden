import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';
import { RootLayout } from './RootLayout';

type PageRouteComponents = {
  HomeRoute: ComponentType;
  AboutRoute: ComponentType;
  BlogIndexRoute: ComponentType;
  BlogPaginationRoute: ComponentType;
  BlogPostRoute: ComponentType;
  TagsIndexRoute: ComponentType;
  TagRoute: ComponentType;
  TagPaginationRoute: ComponentType;
  ArchiveIndexRoute: ComponentType;
  MonthArchiveRoute: ComponentType;
  MonthArchivePaginationRoute: ComponentType;
  SearchRoute: ComponentType;
  NotFoundRoute: ComponentType;
};

export function createRoutes(components: PageRouteComponents): RouteObject[] {
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
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <HomeRoute /> },
        { path: 'about', element: <AboutRoute /> },
        { path: 'blog', element: <BlogIndexRoute /> },
        { path: 'blog/page/:page', element: <BlogPaginationRoute /> },
        { path: 'blog/:slug', element: <BlogPostRoute /> },
        { path: 'tags', element: <TagsIndexRoute /> },
        { path: 'tags/:tag', element: <TagRoute /> },
        { path: 'tags/:tag/page/:page', element: <TagPaginationRoute /> },
        { path: 'archive', element: <ArchiveIndexRoute /> },
        { path: 'archive/:month', element: <MonthArchiveRoute /> },
        { path: 'archive/:month/page/:page', element: <MonthArchivePaginationRoute /> },
        { path: 'search', element: <SearchRoute /> },
        { path: '*', element: <NotFoundRoute /> },
      ],
    },
  ];
}
