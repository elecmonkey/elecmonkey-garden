import type { RouteObject } from 'react-router';
import { RootLayout } from './RootLayout';
import {
  AboutRoute,
  ArchiveIndexRoute,
  BlogIndexRoute,
  BlogPaginationRoute,
  BlogPostRoute,
  HomeRoute,
  MonthArchivePaginationRoute,
  MonthArchiveRoute,
  NotFoundRoute,
  SearchRoute,
  TagPaginationRoute,
  TagRoute,
  TagsIndexRoute,
} from './PageRoutes';

export const routes: RouteObject[] = [
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
