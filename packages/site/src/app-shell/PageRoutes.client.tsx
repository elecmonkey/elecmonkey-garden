import { lazy, Suspense, type ReactNode } from 'react';
import { useParams } from 'react-router';

export const clientRouteLoaders = {
  home: () => import('@/app/page'),
  about: () => import('@/app/about/page'),
  blog: () => import('@/app/blog/page'),
  blogPagination: () => import('@/app/blog/page/[page]/page'),
  blogPost: async () => {
    await import('katex/dist/katex.min.css');
    return import('@/app/blog/[slug]/page');
  },
  tags: () => import('@/app/tags/page'),
  tag: () => import('@/app/tags/[tag]/page'),
  tagPagination: () => import('@/app/tags/[tag]/page/[page]/page'),
  archive: () => import('@/app/archive/page'),
  monthArchive: () => import('@/app/archive/[month]/page'),
  monthArchivePagination: () => import('@/app/archive/[month]/page/[page]/page'),
  search: () => import('@/app/search/page'),
  notFound: () => import('@/app/not-found'),
};

const HomePage = lazy(clientRouteLoaders.home);
const AboutPage = lazy(clientRouteLoaders.about);
const BlogPage = lazy(clientRouteLoaders.blog);
const BlogPaginationPage = lazy(clientRouteLoaders.blogPagination);
const BlogPostPage = lazy(clientRouteLoaders.blogPost);
const TagsIndexPage = lazy(clientRouteLoaders.tags);
const TagPage = lazy(clientRouteLoaders.tag);
const TagPaginationPage = lazy(clientRouteLoaders.tagPagination);
const ArchiveIndexPage = lazy(clientRouteLoaders.archive);
const MonthArchivePage = lazy(clientRouteLoaders.monthArchive);
const MonthArchivePaginationPage = lazy(clientRouteLoaders.monthArchivePagination);
const SearchPage = lazy(clientRouteLoaders.search);
const NotFoundPage = lazy(clientRouteLoaders.notFound);

function PageLoader() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 text-muted-foreground">
      正在加载页面...
    </div>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>;
}

export function HomeRoute() {
  return withSuspense(<HomePage />);
}

export function AboutRoute() {
  return withSuspense(<AboutPage />);
}

export function BlogIndexRoute() {
  return withSuspense(<BlogPage />);
}

export function TagsIndexRoute() {
  return withSuspense(<TagsIndexPage />);
}

export function ArchiveIndexRoute() {
  return withSuspense(<ArchiveIndexPage />);
}

export function NotFoundRoute() {
  return withSuspense(<NotFoundPage />);
}

export function BlogPaginationRoute() {
  const { page = '1' } = useParams();
  return withSuspense(<BlogPaginationPage params={{ page }} />);
}

export function BlogPostRoute() {
  const { slug = '' } = useParams();
  return withSuspense(<BlogPostPage params={{ slug }} />);
}

export function TagRoute() {
  const { tag = '' } = useParams();
  return withSuspense(<TagPage params={{ tag }} />);
}

export function TagPaginationRoute() {
  const { tag = '', page = '1' } = useParams();
  return withSuspense(<TagPaginationPage params={{ tag, page }} />);
}

export function MonthArchiveRoute() {
  const { month = '' } = useParams();
  return withSuspense(<MonthArchivePage params={{ month }} />);
}

export function MonthArchivePaginationRoute() {
  const { month = '', page = '1' } = useParams();
  return withSuspense(<MonthArchivePaginationPage params={{ month, page }} />);
}

export function SearchRoute() {
  return withSuspense(<SearchPage />);
}
