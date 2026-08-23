import { Suspense, type ReactNode } from 'react';
import { useParams } from 'react-router';
import type { Locale } from '@/lib/i18n';
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

function withSuspense(node: ReactNode) {
  return <Suspense fallback={null}>{node}</Suspense>;
}

export function HomeRoute({ locale }: { locale: Locale }) {
  return withSuspense(<HomePage locale={locale} />);
}

export function AboutRoute({ locale }: { locale: Locale }) {
  return withSuspense(<AboutPage locale={locale} />);
}

export function BlogIndexRoute({ locale }: { locale: Locale }) {
  return withSuspense(<BlogPage locale={locale} />);
}

export function TagsIndexRoute({ locale }: { locale: Locale }) {
  return withSuspense(<TagsIndexPage locale={locale} />);
}

export function ArchiveIndexRoute({ locale }: { locale: Locale }) {
  return withSuspense(<ArchiveIndexPage locale={locale} />);
}

export function NotFoundRoute({ locale }: { locale: Locale }) {
  return withSuspense(<NotFoundPage locale={locale} />);
}

export function BlogPaginationRoute({ locale }: { locale: Locale }) {
  const { page = '1' } = useParams();
  return withSuspense(<BlogPaginationPage locale={locale} params={{ page }} />);
}

export function BlogPostRoute({ locale }: { locale: Locale }) {
  const { slug = '' } = useParams();
  return withSuspense(<BlogPostPage locale={locale} params={{ slug }} />);
}

export function TagRoute({ locale }: { locale: Locale }) {
  const { tag = '' } = useParams();
  return withSuspense(<TagPage locale={locale} params={{ tag }} />);
}

export function TagPaginationRoute({ locale }: { locale: Locale }) {
  const { tag = '', page = '1' } = useParams();
  return withSuspense(<TagPaginationPage locale={locale} params={{ tag, page }} />);
}

export function MonthArchiveRoute({ locale }: { locale: Locale }) {
  const { month = '' } = useParams();
  return withSuspense(<MonthArchivePage locale={locale} params={{ month }} />);
}

export function MonthArchivePaginationRoute({ locale }: { locale: Locale }) {
  const { month = '', page = '1' } = useParams();
  return withSuspense(<MonthArchivePaginationPage locale={locale} params={{ month, page }} />);
}

export function SearchRoute({ locale }: { locale: Locale }) {
  return withSuspense(<SearchPage locale={locale} />);
}
