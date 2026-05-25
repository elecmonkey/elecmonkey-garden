import { useParams, useSearchParams } from 'react-router';
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

export function HomeRoute() {
  return <HomePage />;
}

export function AboutRoute() {
  return <AboutPage />;
}

export function BlogIndexRoute() {
  return <BlogPage />;
}

export function TagsIndexRoute() {
  return <TagsIndexPage />;
}

export function ArchiveIndexRoute() {
  return <ArchiveIndexPage />;
}

export function NotFoundRoute() {
  return <NotFoundPage />;
}

export function BlogPaginationRoute() {
  const { page = '1' } = useParams();
  return <BlogPaginationPage params={{ page }} />;
}

export function BlogPostRoute() {
  const { slug = '' } = useParams();
  return <BlogPostPage params={{ slug }} />;
}

export function TagRoute() {
  const { tag = '' } = useParams();
  return <TagPage params={{ tag }} />;
}

export function TagPaginationRoute() {
  const { tag = '', page = '1' } = useParams();
  return <TagPaginationPage params={{ tag, page }} />;
}

export function MonthArchiveRoute() {
  const { month = '' } = useParams();
  return <MonthArchivePage params={{ month }} />;
}

export function MonthArchivePaginationRoute() {
  const { month = '', page = '1' } = useParams();
  return <MonthArchivePaginationPage params={{ month, page }} />;
}

export function SearchRoute() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? undefined;
  const page = searchParams.get('page') ?? undefined;
  return <SearchPage searchParams={{ keyword, page }} />;
}
