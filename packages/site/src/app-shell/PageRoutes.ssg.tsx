import { Suspense, type ReactNode } from 'react';
import { useParams } from 'react-router';
import HomePage from '@/app/page';
import AboutPage from '@/app/about/page';
import BlogPage from '@/app/blog/page';
import BlogPaginationPage from '@/app/blog/page/[page]/page';
import BlogPostPage from '@/app/blog/[slug]/page';
import TagsIndexPage from '@/app/tags/page';
import TagPage from '@/app/tags/[tag]/page';
import TagPaginationPage from '@/app/tags/[tag]/page/[page]/page';
import ArchiveIndexPage from '@/app/archive/page';
import MonthArchivePage from '@/app/archive/[month]/page';
import MonthArchivePaginationPage from '@/app/archive/[month]/page/[page]/page';
import SearchPage from '@/app/search/page';
import NotFoundPage from '@/app/not-found';

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
