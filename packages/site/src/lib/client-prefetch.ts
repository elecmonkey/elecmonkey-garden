type PrefetchPriority = 'intent' | 'viewport';
type PrefetchTask = () => Promise<void> | void;
type PrefetchableRouteKey = 'home' | 'about' | 'blog' | 'tags' | 'archive' | 'search';
type PrefetchLinkAs = 'font' | 'script' | 'style' | 'fetch';
type PrefetchLinkRel = 'prefetch' | 'preload';

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

const MAX_CONCURRENT_PREFETCHES = 2;
const prefetchedKeys = new Set<string>();
const pendingKeys = new Set<string>();
const scheduledViewportTasks = new Map<string, PrefetchTask>();
const queuedTasks: Array<{ key: string; task: PrefetchTask }> = [];
let activePrefetches = 0;
let blogPostRoutePrefetch: Promise<void> | undefined;
const prefetchedAssets = new Set<string>();

const KATEX_CORE_FONT_URLS = [
  '/static/font/KaTeX_Main-Regular.0462f03bdf.woff2',
  '/static/font/KaTeX_Math-Italic.f28c23acad.woff2',
  '/static/font/KaTeX_Size1-Regular.eae34984b3.woff2',
];

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

function canPrefetch(priority: PrefetchPriority): boolean {
  if (typeof window === 'undefined') return false;

  const connection = getConnection();
  if (connection?.saveData) return false;

  if (priority === 'viewport') {
    const effectiveType = connection?.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return false;
    }
  }

  return true;
}

function scheduleIdle(callback: () => void) {
  if (typeof window === 'undefined') return;

  const requestIdleCallback = (window as Window & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  }).requestIdleCallback;

  if (requestIdleCallback) {
    requestIdleCallback(callback, { timeout: 3000 });
    return;
  }

  globalThis.setTimeout(callback, 1200);
}

function runNextPrefetch() {
  if (activePrefetches >= MAX_CONCURRENT_PREFETCHES) return;

  const item = queuedTasks.shift();
  if (!item) return;

  activePrefetches += 1;

  Promise.resolve(item.task())
    .then(() => {
      prefetchedKeys.add(item.key);
    })
    .catch(() => {
      // Prefetch is best-effort. Keep failures silent so the next navigation can
      // perform the real load and surface any user-visible error.
    })
    .finally(() => {
      pendingKeys.delete(item.key);
      activePrefetches -= 1;
      runNextPrefetch();
    });
}

function enqueueNow(key: string, task: PrefetchTask) {
  if (prefetchedKeys.has(key) || pendingKeys.has(key)) return;

  pendingKeys.add(key);
  queuedTasks.push({ key, task });
  runNextPrefetch();
}

function enqueuePrefetch(key: string, task: PrefetchTask, priority: PrefetchPriority) {
  if (!canPrefetch(priority)) return;
  if (prefetchedKeys.has(key) || pendingKeys.has(key)) return;

  const scheduledTask = scheduledViewportTasks.get(key);

  if (priority === 'intent') {
    scheduledViewportTasks.delete(key);
    enqueueNow(key, scheduledTask ?? task);
  } else {
    if (scheduledTask) return;

    scheduledViewportTasks.set(key, task);
    scheduleIdle(() => {
      const currentTask = scheduledViewportTasks.get(key);
      if (!currentTask) return;

      scheduledViewportTasks.delete(key);
      enqueueNow(key, currentTask);
    });
  }
}

function normalizeInternalHref(href: string): URL | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return undefined;
    return url;
  } catch {
    return undefined;
  }
}

function extractBlogSlug(pathname: string): string | undefined {
  const match = pathname.match(/^\/blog\/([^/?#]+)\/?$/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function warmAsset(url: string, as: PrefetchLinkAs, rel: PrefetchLinkRel = 'prefetch') {
  const key = `${rel}:${url}`;
  if (typeof document === 'undefined' || prefetchedAssets.has(key)) return;

  prefetchedAssets.add(key);

  const link = document.createElement('link');
  link.rel = rel;
  link.href = url;
  link.as = as;

  if (as === 'font') {
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

function prefetchArticleFonts() {
  for (const url of KATEX_CORE_FONT_URLS) {
    // Fonts are render-blocking for KaTeX once the article chunk is displayed.
    // Warm them with preload during route/content prefetch so the later CSS
    // font request can be satisfied from the preload/cache entry instead of
    // starting only after navigation.
    warmAsset(url, 'font', 'preload');
  }
}

function prefetchBlogPost(slug: string): Promise<void> {
  const routePrefetch = prefetchBlogPostRoute();
  const contentPrefetch = import('@/lib/api').then(({ prefetchPostById }) => prefetchPostById(slug));

  return Promise.all([routePrefetch, contentPrefetch]).then(() => undefined);
}

function prefetchBlogPostRoute(): Promise<void> {
  if (!blogPostRoutePrefetch) {
    blogPostRoutePrefetch = import('@/app-shell/PageRoutes.client')
      .then(({ clientRouteLoaders }) => clientRouteLoaders.blogPost())
      .then(() => undefined);
  }

  return blogPostRoutePrefetch;
}

async function prefetchSearchPage(): Promise<void> {
  const { clientRouteLoaders } = await import('@/app-shell/PageRoutes.client');
  const { prefetchSearchIndexPosts } = await import('@/lib/search');

  await Promise.all([
    clientRouteLoaders.search(),
    prefetchSearchIndexPosts(),
  ]);
}

async function prefetchRoute(key: PrefetchableRouteKey): Promise<void> {
  const { clientRouteLoaders } = await import('@/app-shell/PageRoutes.client');

  switch (key) {
    case 'home':
      await clientRouteLoaders.home();
      break;
    case 'about':
      await clientRouteLoaders.about();
      break;
    case 'blog':
      await clientRouteLoaders.blog();
      break;
    case 'tags':
      await clientRouteLoaders.tags();
      break;
    case 'archive':
      await clientRouteLoaders.archive();
      break;
    case 'search':
      await clientRouteLoaders.search();
      break;
  }
}

export function prefetchHref(href: string | undefined, priority: PrefetchPriority = 'intent') {
  if (!href) return;

  const url = normalizeInternalHref(href);
  if (!url) return;

  const slug = extractBlogSlug(url.pathname);
  if (slug) {
    enqueuePrefetch(`post:${slug}`, () => prefetchBlogPost(slug), priority);
    return;
  }

  if (url.pathname === '/') {
    enqueuePrefetch('route:/', () => prefetchRoute('home'), priority);
    return;
  }

  if (url.pathname === '/about') {
    enqueuePrefetch('route:/about', () => prefetchRoute('about'), priority);
    return;
  }

  if (url.pathname === '/blog' || /^\/blog\/page\/\d+\/?$/.test(url.pathname)) {
    enqueuePrefetch(`route:${url.pathname}`, () => prefetchRoute('blog'), priority);
    return;
  }

  if (url.pathname === '/tags') {
    enqueuePrefetch('route:/tags', () => prefetchRoute('tags'), priority);
    return;
  }

  if (url.pathname === '/archive') {
    enqueuePrefetch('route:/archive', () => prefetchRoute('archive'), priority);
    return;
  }

  if (url.pathname === '/search') {
    const searchParams = url.searchParams;
    const hasSearchIntent = searchParams.has('keyword') || searchParams.has('page');

    enqueuePrefetch(
      hasSearchIntent ? `route:${url.pathname}${url.search}` : 'route:/search',
      () => (hasSearchIntent ? prefetchSearchPage() : prefetchRoute('search')),
      priority,
    );
  }
}

export function prefetchArticleBySlug(slug: string, priority: PrefetchPriority = 'viewport') {
  prefetchArticleFonts();
  enqueuePrefetch(`post:${slug}`, () => prefetchBlogPost(slug), priority);
}
