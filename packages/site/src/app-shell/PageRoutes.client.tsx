import { lazy, Suspense, type ReactNode } from 'react';
import { useParams } from 'react-router';

const HomePage = lazy(() => import('@/app/page'));
const AboutPage = lazy(() => import('@/app/about/page'));
const BlogPage = lazy(() => import('@/app/blog/page'));
const BlogPaginationPage = lazy(() => import('@/app/blog/page/[page]/page'));
const BlogPostPage = lazy(async () => {
  await import('katex/dist/katex.min.css');
  return import('@/app/blog/[slug]/page');
});
const TagsIndexPage = lazy(() => import('@/app/tags/page'));
const TagPage = lazy(() => import('@/app/tags/[tag]/page'));
const TagPaginationPage = lazy(() => import('@/app/tags/[tag]/page/[page]/page'));
const ArchiveIndexPage = lazy(() => import('@/app/archive/page'));
const MonthArchivePage = lazy(() => import('@/app/archive/[month]/page'));
const MonthArchivePaginationPage = lazy(() => import('@/app/archive/[month]/page/[page]/page'));
const SearchPage = lazy(() => import('@/app/search/page'));
const NotFoundPage = lazy(() => import('@/app/not-found'));

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
