import { lazy, Suspense, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { useParams } from 'react-router';
import type { Locale } from '@/lib/i18n';

type RouteModule<TComponent extends ComponentType<any>> = {
  default: TComponent;
};

type RouteLoader<TComponent extends ComponentType<any>> = () => Promise<RouteModule<TComponent>>;

type PreloadableRoute<TComponent extends ComponentType<any>> = ComponentType<ComponentProps<TComponent>> & {
  preload: () => Promise<RouteModule<TComponent>>;
};

function createPreloadableRoute<TComponent extends ComponentType<any>>(
  loader: RouteLoader<TComponent>,
): PreloadableRoute<TComponent> {
  let loadedModule: RouteModule<TComponent> | undefined;
  let loadingPromise: Promise<RouteModule<TComponent>> | undefined;

  const preload = () => {
    if (loadedModule) {
      return Promise.resolve(loadedModule);
    }

    if (!loadingPromise) {
      loadingPromise = loader()
        .then((module) => {
          loadedModule = module;
          return module;
        })
        .catch((error) => {
          loadingPromise = undefined;
          throw error;
        });
    }

    return loadingPromise;
  };

  const LazyRoute = lazy(preload);

  function PreloadableRouteComponent(props: ComponentProps<TComponent>) {
    if (loadedModule) {
      const ResolvedRoute = loadedModule.default;
      return <ResolvedRoute {...props} />;
    }

    return <LazyRoute {...props} />;
  }

  return Object.assign(PreloadableRouteComponent, { preload });
}

const HomePage = createPreloadableRoute(() => import('@/app/page'));
const AboutPage = createPreloadableRoute(() => import('@/app/about/page'));
const BlogPage = createPreloadableRoute(() => import('@/app/blog/page'));
const BlogPaginationPage = createPreloadableRoute(() => import('@/app/blog/page/[page]/page'));
const BlogPostPage = createPreloadableRoute(() => import('@/app/blog/[slug]/page'));
const TagsIndexPage = createPreloadableRoute(() => import('@/app/tags/page'));
const TagPage = createPreloadableRoute(() => import('@/app/tags/[tag]/page'));
const TagPaginationPage = createPreloadableRoute(() => import('@/app/tags/[tag]/page/[page]/page'));
const ArchiveIndexPage = createPreloadableRoute(() => import('@/app/archive/page'));
const MonthArchivePage = createPreloadableRoute(() => import('@/app/archive/[month]/page'));
const MonthArchivePaginationPage = createPreloadableRoute(() => import('@/app/archive/[month]/page/[page]/page'));
const SearchPage = createPreloadableRoute(() => import('@/app/search/page'));
const NotFoundPage = createPreloadableRoute(() => import('@/app/not-found'));

export const clientRouteLoaders = {
  home: HomePage.preload,
  about: AboutPage.preload,
  blog: BlogPage.preload,
  blogPagination: BlogPaginationPage.preload,
  blogPost: BlogPostPage.preload,
  tags: TagsIndexPage.preload,
  tag: TagPage.preload,
  tagPagination: TagPaginationPage.preload,
  archive: ArchiveIndexPage.preload,
  monthArchive: MonthArchivePage.preload,
  monthArchivePagination: MonthArchivePaginationPage.preload,
  search: SearchPage.preload,
  notFound: NotFoundPage.preload,
};

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
