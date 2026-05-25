import type { RouteObject } from 'react-router';
import { RootLayout } from './RootLayout';
import { RoutePlaceholder } from './RoutePlaceholders';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <RoutePlaceholder title="Elecmonkey的小花园" /> },
      { path: 'about', element: <RoutePlaceholder title="关于我" /> },
      { path: 'blog', element: <RoutePlaceholder title="所有文章" /> },
      { path: 'blog/page/:page', element: <RoutePlaceholder title="所有文章分页" /> },
      { path: 'blog/:slug', element: <RoutePlaceholder title="文章详情" /> },
      { path: 'tags', element: <RoutePlaceholder title="标签" /> },
      { path: 'tags/:tag', element: <RoutePlaceholder title="标签文章" /> },
      { path: 'tags/:tag/page/:page', element: <RoutePlaceholder title="标签文章分页" /> },
      { path: 'archive', element: <RoutePlaceholder title="文章归档" /> },
      { path: 'archive/:month', element: <RoutePlaceholder title="月份归档" /> },
      { path: 'archive/:month/page/:page', element: <RoutePlaceholder title="月份归档分页" /> },
      { path: 'search', element: <RoutePlaceholder title="搜索" /> },
      { path: '*', element: <RoutePlaceholder title="页面未找到" /> },
    ],
  },
];
