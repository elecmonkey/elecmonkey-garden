import { useParams, useSearchParams } from 'react-router';
import { createAsyncComponent } from '@/lib/async-component';
import PageContainer from '@/components/layout/PageContainer';
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

const LoadingFallback = () => (
  <PageContainer>
    <p className="text-muted-foreground">加载中...</p>
  </PageContainer>
);

export const HomeRoute = createAsyncComponent(() => HomePage());
export const AboutRoute = createAsyncComponent(() => Promise.resolve(<AboutPage />));
export const BlogIndexRoute = createAsyncComponent(() => BlogPage());
export const TagsIndexRoute = createAsyncComponent(() => TagsIndexPage());
export const ArchiveIndexRoute = createAsyncComponent(() => ArchiveIndexPage());
export const NotFoundRoute = createAsyncComponent(() => Promise.resolve(<NotFoundPage />));

export function BlogPaginationRoute() {
  const { page = '1' } = useParams();
  const Component = createAsyncComponent(() => BlogPaginationPage({ params: Promise.resolve({ page }) }));
  return <Component fallback={<LoadingFallback />} />;
}

export function BlogPostRoute() {
  const { slug = '' } = useParams();
  const Component = createAsyncComponent(() => BlogPostPage({ params: Promise.resolve({ slug }) }));
  return <Component fallback={<LoadingFallback />} />;
}

export function TagRoute() {
  const { tag = '' } = useParams();
  const Component = createAsyncComponent(() => TagPage({ params: Promise.resolve({ tag }) }));
  return <Component fallback={<LoadingFallback />} />;
}

export function TagPaginationRoute() {
  const { tag = '', page = '1' } = useParams();
  const Component = createAsyncComponent(() => TagPaginationPage({ params: Promise.resolve({ tag, page }) }));
  return <Component fallback={<LoadingFallback />} />;
}

export function MonthArchiveRoute() {
  const { month = '' } = useParams();
  const Component = createAsyncComponent(() => MonthArchivePage({ params: Promise.resolve({ month }) }));
  return <Component fallback={<LoadingFallback />} />;
}

export function MonthArchivePaginationRoute() {
  const { month = '', page = '1' } = useParams();
  const Component = createAsyncComponent(() => MonthArchivePaginationPage({ params: Promise.resolve({ month, page }) }));
  return <Component fallback={<LoadingFallback />} />;
}

export function SearchRoute() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? undefined;
  const page = searchParams.get('page') ?? undefined;
  const Component = createAsyncComponent(() => SearchPage({ searchParams: Promise.resolve({ keyword, page }) }));
  return <Component fallback={<LoadingFallback />} />;
}
