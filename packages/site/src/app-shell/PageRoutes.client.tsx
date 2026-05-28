import { lazy, Suspense, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { useParams } from 'react-router';

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
      loadingPromise = loader().then((module) => {
        loadedModule = module;
        return module;
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
