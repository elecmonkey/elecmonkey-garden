import { type Locale, getLocaleFromPathname, stripLocalePrefix } from './i18n';

type PrefetchPriority = 'intent' | 'viewport' | 'adjacent';
type PrefetchTask = () => Promise<void> | void;
type PrefetchableRouteKey = 'home' | 'about' | 'blog' | 'blogPagination' | 'tags' | 'archive' | 'search';
type QueuePriority = 'intent' | 'background';
type BackgroundArticleKind = 'viewport' | 'adjacent';

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type PrefetchPolicy = {
  allowIntent: boolean;
  viewportArticleBudget: number;
  adjacentArticleBudget: number;
};

type QueuedPrefetch = {
  backgroundIndex?: number;
  backgroundKind?: BackgroundArticleKind;
  key: string;
  priority: QueuePriority;
  scope: string;
  task: PrefetchTask;
};

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const PAGE_SETTLE_DELAY_MS = 650;
const BACKGROUND_FALLBACK_DELAY_MS = 1500;

const prefetchedKeys = new Set<string>();
const queuedByKey = new Map<string, QueuedPrefetch>();
const intentQueue: QueuedPrefetch[] = [];
const backgroundQueue: QueuedPrefetch[] = [];
const backgroundArticleReservations: Record<BackgroundArticleKind, number> = {
  viewport: 0,
  adjacent: 0,
};

let activePrefetch: QueuedPrefetch | undefined;
let blogPostRoutePrefetch: Promise<void> | undefined;
let currentScope = getWindowScope();
let documentLoaded = typeof document !== 'undefined' && document.readyState === 'complete';
let navigationInProgress = false;
let pageSettled = false;
let settleTimer: number | undefined;
let cancelBackgroundTurn: (() => void) | undefined;

if (typeof window !== 'undefined') {
  if (!documentLoaded) {
    window.addEventListener('load', handleDocumentLoad, { once: true });
  }
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

function getWindowScope(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.pathname}${window.location.search}`;
}

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

function getPrefetchPolicy(): PrefetchPolicy {
  const connection = getConnection();
  if (connection?.saveData) {
    return { allowIntent: false, viewportArticleBudget: 0, adjacentArticleBudget: 0 };
  }

  switch (connection?.effectiveType) {
    case 'slow-2g':
    case '2g':
      return { allowIntent: false, viewportArticleBudget: 0, adjacentArticleBudget: 0 };
    case '3g':
      return { allowIntent: true, viewportArticleBudget: 1, adjacentArticleBudget: 1 };
    case '4g':
      return { allowIntent: true, viewportArticleBudget: 3, adjacentArticleBudget: 2 };
    default:
      // Safari and desktop Firefox do not expose the Network Information API.
      // Treat missing or unfamiliar values as a conservative, fully supported fallback.
      return { allowIntent: true, viewportArticleBudget: 2, adjacentArticleBudget: 2 };
  }
}

function isDocumentVisible(): boolean {
  return typeof document !== 'undefined' && document.visibilityState !== 'hidden';
}

function handleDocumentLoad() {
  documentLoaded = true;
  scheduleBackgroundPrefetch();
}

function handleVisibilityChange() {
  if (!isDocumentVisible()) {
    cancelScheduledBackgroundPrefetch();
    return;
  }

  if (intentQueue.length > 0) {
    runNextPrefetch();
  } else {
    scheduleBackgroundPrefetch();
  }
}

function cancelSettleTimer() {
  if (settleTimer !== undefined) {
    window.clearTimeout(settleTimer);
    settleTimer = undefined;
  }
}

function cancelScheduledBackgroundPrefetch() {
  cancelBackgroundTurn?.();
  cancelBackgroundTurn = undefined;
}

function clearQueue(queue: QueuedPrefetch[]) {
  for (const item of queue) {
    queuedByKey.delete(item.key);
  }
  queue.length = 0;
}

function clearQueuedPrefetches() {
  clearQueue(intentQueue);
  clearQueue(backgroundQueue);
}

function resetBackgroundArticleReservations() {
  backgroundArticleReservations.viewport = 0;
  backgroundArticleReservations.adjacent = 0;
}

export function syncPrefetchNavigation(isNavigating: boolean, scope: string) {
  if (typeof window === 'undefined') return;

  if (isNavigating) {
    navigationInProgress = true;
    pageSettled = false;
    cancelSettleTimer();
    cancelScheduledBackgroundPrefetch();
    clearQueuedPrefetches();
    return;
  }

  const scopeChanged = scope !== currentScope;
  navigationInProgress = false;

  if (scopeChanged) {
    currentScope = scope;
    clearQueuedPrefetches();
    resetBackgroundArticleReservations();
  }

  if (!pageSettled && settleTimer === undefined) {
    settleTimer = window.setTimeout(() => {
      settleTimer = undefined;
      pageSettled = true;
      scheduleBackgroundPrefetch();
    }, PAGE_SETTLE_DELAY_MS);
  }

  runNextPrefetch();
}

function hasPrefetch(key: string): boolean {
  return prefetchedKeys.has(key) || queuedByKey.has(key) || activePrefetch?.key === key;
}

function removeFromQueue(queue: QueuedPrefetch[], item: QueuedPrefetch) {
  const index = queue.indexOf(item);
  if (index !== -1) {
    queue.splice(index, 1);
  }
}

function enqueueIntent(key: string, task: PrefetchTask) {
  const policy = getPrefetchPolicy();
  if (
    !policy.allowIntent
    || !documentLoaded
    || navigationInProgress
    || !isDocumentVisible()
    || prefetchedKeys.has(key)
    || activePrefetch?.key === key
  ) {
    return;
  }

  const existing = queuedByKey.get(key);
  if (existing) {
    if (existing.priority === 'background') {
      removeFromQueue(backgroundQueue, existing);
      existing.priority = 'intent';
      existing.scope = currentScope;
      intentQueue.push(existing);
      cancelScheduledBackgroundPrefetch();
      runNextPrefetch();
    }
    return;
  }

  const item: QueuedPrefetch = {
    key,
    priority: 'intent',
    scope: currentScope,
    task,
  };
  queuedByKey.set(key, item);
  intentQueue.push(item);
  cancelScheduledBackgroundPrefetch();
  runNextPrefetch();
}

function getBackgroundArticleBudget(kind: BackgroundArticleKind): number {
  const policy = getPrefetchPolicy();
  return kind === 'viewport' ? policy.viewportArticleBudget : policy.adjacentArticleBudget;
}

function enqueueBackgroundArticle(key: string, task: PrefetchTask, kind: BackgroundArticleKind) {
  if (navigationInProgress || hasPrefetch(key)) return;

  const budget = getBackgroundArticleBudget(kind);
  if (budget === 0 || backgroundArticleReservations[kind] >= budget) return;

  backgroundArticleReservations[kind] += 1;
  const item: QueuedPrefetch = {
    backgroundIndex: backgroundArticleReservations[kind],
    backgroundKind: kind,
    key,
    priority: 'background',
    scope: currentScope,
    task,
  };
  queuedByKey.set(key, item);
  backgroundQueue.push(item);
  scheduleBackgroundPrefetch();
}

function takeNextPrefetch(): QueuedPrefetch | undefined {
  const policy = getPrefetchPolicy();

  while (intentQueue.length > 0) {
    const item = intentQueue.shift()!;
    queuedByKey.delete(item.key);
    if (item.scope === currentScope && policy.allowIntent) {
      return item;
    }
  }

  if (!pageSettled) return undefined;

  while (backgroundQueue.length > 0) {
    const item = backgroundQueue.shift()!;
    queuedByKey.delete(item.key);
    if (
      item.scope === currentScope
      && item.backgroundKind
      && item.backgroundIndex
      && item.backgroundIndex <= getBackgroundArticleBudget(item.backgroundKind)
    ) {
      return item;
    }
  }

  return undefined;
}

function runNextPrefetch() {
  if (
    activePrefetch
    || navigationInProgress
    || !documentLoaded
    || !isDocumentVisible()
  ) {
    return;
  }

  const item = takeNextPrefetch();
  if (!item) return;

  activePrefetch = item;
  Promise.resolve()
    .then(item.task)
    .then(() => {
      prefetchedKeys.add(item.key);
    })
    .catch(() => {
      // Prefetch is best-effort. Failed tasks remain retryable by intent or navigation.
    })
    .finally(() => {
      activePrefetch = undefined;
      if (intentQueue.length > 0) {
        runNextPrefetch();
      } else {
        scheduleBackgroundPrefetch();
      }
    });
}

function scheduleBackgroundPrefetch() {
  if (
    cancelBackgroundTurn
    || activePrefetch
    || backgroundQueue.length === 0
    || navigationInProgress
    || !documentLoaded
    || !pageSettled
    || !isDocumentVisible()
  ) {
    return;
  }

  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
    const cancelIdleCallback = idleWindow.cancelIdleCallback;
    const handle = idleWindow.requestIdleCallback(() => {
      cancelBackgroundTurn = undefined;
      runNextPrefetch();
    });
    cancelBackgroundTurn = () => cancelIdleCallback(handle);
    return;
  }

  // requestIdleCallback is not Baseline (notably missing in some Safari versions).
  // A longer post-settle delay preserves the optimization without making it required.
  const handle = window.setTimeout(() => {
    cancelBackgroundTurn = undefined;
    runNextPrefetch();
  }, BACKGROUND_FALLBACK_DELAY_MS);
  cancelBackgroundTurn = () => window.clearTimeout(handle);
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
  const match = stripLocalePrefix(pathname).match(/^\/blog\/([^/?#]+)\/?$/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function prefetchBlogPost(locale: Locale, slug: string): Promise<void> {
  const routePrefetch = prefetchBlogPostRoute();
  const contentPrefetch = import('@/lib/api').then(({ prefetchPostById }) => prefetchPostById(locale, slug));

  return Promise.all([routePrefetch, contentPrefetch]).then(() => undefined);
}

function prefetchBlogPostRoute(): Promise<void> {
  if (!blogPostRoutePrefetch) {
    blogPostRoutePrefetch = import('@/app-shell/PageRoutes.client')
      .then(({ clientRouteLoaders }) => clientRouteLoaders.blogPost())
      .then(() => undefined)
      .catch((error) => {
        blogPostRoutePrefetch = undefined;
        throw error;
      });
  }

  return blogPostRoutePrefetch;
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
    case 'blogPagination':
      await clientRouteLoaders.blogPagination();
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

export function prefetchHref(href: string | undefined) {
  if (!href) return;

  const url = normalizeInternalHref(href);
  if (!url) return;

  if (
    url.pathname === window.location.pathname
    && url.search === window.location.search
  ) {
    return;
  }

  const slug = extractBlogSlug(url.pathname);
  const locale = getLocaleFromPathname(url.pathname);
  const strippedPathname = stripLocalePrefix(url.pathname);
  if (slug) {
    enqueueIntent(`post:${locale}:${slug}`, () => prefetchBlogPost(locale, slug));
    return;
  }

  if (strippedPathname === '/') {
    enqueueIntent(`route:${locale}:/`, () => prefetchRoute('home'));
    return;
  }

  if (strippedPathname === '/about') {
    enqueueIntent(`route:${locale}:/about`, () => prefetchRoute('about'));
    return;
  }

  if (strippedPathname === '/blog') {
    enqueueIntent(`route:${url.pathname}`, () => prefetchRoute('blog'));
    return;
  }

  if (/^\/blog\/page\/\d+\/?$/.test(strippedPathname)) {
    enqueueIntent(`route:${url.pathname}`, () => prefetchRoute('blogPagination'));
    return;
  }

  if (strippedPathname === '/tags') {
    enqueueIntent(`route:${locale}:/tags`, () => prefetchRoute('tags'));
    return;
  }

  if (strippedPathname === '/archive') {
    enqueueIntent(`route:${locale}:/archive`, () => prefetchRoute('archive'));
    return;
  }

  if (strippedPathname === '/search') {
    enqueueIntent(`route:${locale}:/search`, () => prefetchRoute('search'));
  }
}

export function prefetchArticleBySlug(locale: Locale, slug: string, priority: PrefetchPriority = 'viewport') {
  const key = `post:${locale}:${slug}`;
  const task = () => prefetchBlogPost(locale, slug);

  if (priority === 'intent') {
    enqueueIntent(key, task);
  } else {
    enqueueBackgroundArticle(key, task, priority);
  }
}

export function prefetchAdjacentArticles(locale: Locale, slugs: Array<string | undefined>) {
  for (const slug of slugs) {
    if (slug) {
      prefetchArticleBySlug(locale, slug, 'adjacent');
    }
  }
}
