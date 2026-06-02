import { metadata as homeMetadata } from '../app/page';
import { metadata as aboutMetadata } from '../app/about/page';
import { metadata as blogMetadata } from '../app/blog/page';
import { generateMetadata as generateBlogPageMetadata } from '../app/blog/page/[page]/page';
import { generateMetadata as generateBlogPostMetadata } from '../app/blog/[slug]/page';
import { metadata as tagsMetadata } from '../app/tags/page';
import { generateMetadata as generateTagMetadata } from '../app/tags/[tag]/page';
import { generateMetadata as generateTagPageMetadata } from '../app/tags/[tag]/page/[page]/page';
import { metadata as archiveMetadata } from '../app/archive/page';
import { generateMetadata as generateMonthMetadata } from '../app/archive/[month]/page';
import { generateMetadata as generateMonthPageMetadata } from '../app/archive/[month]/page/[page]/page';
import { generateMetadata as generateSearchMetadata } from '../app/search/page';
import { getStaticPathnames } from '../app-shell/static-paths';
import { type Locale, dictionaries, getLocaleFromPathname, hrefFor, locales, stripLocalePrefix } from '../lib/i18n';
import type { RobotsValue, SiteMetadata } from './metadata-types';

const siteUrl = 'https://www.elecmonkey.com';

const rootMetadata: SiteMetadata = {
  title: 'Elecmonkey的小花园',
  description: 'Elecmonkey的小花园是一个专注于前端技术的技术博客，分享JavaScript、TypeScript、React、Vue、Next.js、Vite等前端开发技术、工程化实践、性能优化和最佳实践经验。',
  keywords: ['前端开发', '前端技术', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Next.js', 'Vite', '前端工程化', '技术博客', 'Elecmonkey'],
  authors: [{ name: 'Elecmonkey' }],
  creator: 'Elecmonkey',
  publisher: 'Elecmonkey',
  icons: '/icon.png',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.elecmonkey.com',
    title: 'Elecmonkey的小花园 - 前端技术博客',
    description: '专注于前端技术的技术博客，分享前端开发经验、工程化实践和最佳实践',
    siteName: 'Elecmonkey的小花园',
    images: [{
      url: '/icon.png',
      width: 512,
      height: 512,
      alt: 'Elecmonkey的小花园',
    }],
  },
  twitter: {
    card: 'summary',
    title: 'Elecmonkey的小花园 - 前端技术博客',
    description: '专注于前端技术的技术博客，分享前端开发经验、工程化实践和最佳实践',
    images: ['/icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

function createRootMetadata(locale: Locale): SiteMetadata {
  const dictionary = dictionaries[locale];
  const isEnglish = locale === 'en';

  return {
    ...rootMetadata,
    title: dictionary.siteName,
    description: dictionary.siteDescription,
    keywords: isEnglish
      ? ['frontend development', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Vite', 'web performance', 'technical blog', 'Elecmonkey']
      : rootMetadata.keywords,
    openGraph: {
      ...(rootMetadata.openGraph ?? {}),
      locale: isEnglish ? 'en_US' : 'zh_CN',
      title: isEnglish ? "Elecmonkey's Garden - Frontend Engineering Blog" : 'Elecmonkey的小花园 - 前端技术博客',
      description: dictionary.siteDescription,
      siteName: dictionary.siteName,
    },
    twitter: {
      ...(rootMetadata.twitter ?? {}),
      title: isEnglish ? "Elecmonkey's Garden - Frontend Engineering Blog" : 'Elecmonkey的小花园 - 前端技术博客',
      description: dictionary.siteDescription,
    },
  };
}

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

function mergeMetadata(base: SiteMetadata, route: SiteMetadata | null | undefined): SiteMetadata {
  return {
    ...base,
    ...route,
    openGraph: {
      ...(base.openGraph ?? {}),
      ...(route?.openGraph ?? {}),
    },
    twitter: {
      ...(base.twitter ?? {}),
      ...(route?.twitter ?? {}),
    },
  };
}

function getTitle(metadata: SiteMetadata): string | undefined {
  if (typeof metadata.title === 'string') return metadata.title;
  return metadata.title?.default;
}

function normalizeCanonicalPathname(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withoutTrailingSlash = normalized.replace(/\/+$/g, '');
  return withoutTrailingSlash || '/';
}

function getCanonicalUrl(pathname: string): string {
  const normalized = normalizeCanonicalPathname(pathname);
  return normalized === '/' ? siteUrl : `${siteUrl}${normalized}`;
}

function getAlternateLinks(pathname: string): Array<{ hrefLang: string; href: string }> {
  const stripped = stripLocalePrefix(pathname);

  return locales.map((locale) => ({
    hrefLang: locale === 'en' ? 'en' : 'zh-CN',
    href: getCanonicalUrl(hrefFor(locale, stripped)),
  }));
}

function linkTag(attributes: Record<string, string>): string {
  const serialized = Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ');

  return `<link ${serialized} />`;
}

function getUrlValue(value: unknown, metadata: SiteMetadata): string | undefined {
  if (!value) return undefined;
  const url = typeof value === 'string' ? value : value instanceof URL ? value.toString() : undefined;
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  const base = metadata.metadataBase;
  if (!base) return url;
  return new URL(url, base).toString();
}

function getFirstImage(metadata: SiteMetadata, source: unknown): string | undefined {
  if (!source) return undefined;
  const value = Array.isArray(source) ? source[0] : source;
  if (typeof value === 'string' || value instanceof URL) return getUrlValue(value, metadata);
  if (value && typeof value === 'object' && 'url' in value) {
    return getUrlValue((value as { url?: unknown }).url, metadata);
  }
  return undefined;
}

function robotsToContent(robots: RobotsValue | undefined): string | undefined {
  if (!robots) return undefined;
  if (typeof robots === 'string') return robots;
  const parts: string[] = [];
  if (robots.index !== undefined) parts.push(robots.index ? 'index' : 'noindex');
  if (robots.follow !== undefined) parts.push(robots.follow ? 'follow' : 'nofollow');
  return parts.length > 0 ? parts.join(', ') : undefined;
}

function googleBotToContent(robots: RobotsValue | undefined): string | undefined {
  if (!robots || typeof robots === 'string' || !robots.googleBot) return undefined;
  return Object.entries(robots.googleBot)
    .map(([key, value]) => {
      if (typeof value === 'boolean') return value ? key : `no${key}`;
      return `${key}:${String(value)}`;
    })
    .join(', ');
}

function metaTag(name: string, content: unknown): string {
  return `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}" />`;
}

function propertyTag(property: string, content: unknown): string {
  return `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}" />`;
}

function getRouteParams(pathname: string): { route: string; params: Record<string, string> } {
  const segments = stripLocalePrefix(pathname).replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

  if (segments.length === 0) return { route: 'home', params: {} };
  if (segments[0] === 'about' && segments.length === 1) return { route: 'about', params: {} };
  if (segments[0] === 'blog' && segments.length === 1) return { route: 'blog', params: {} };
  if (segments[0] === 'blog' && segments[1] === 'page' && segments[2]) return { route: 'blog-page', params: { page: segments[2] } };
  if (segments[0] === 'blog' && segments[1]) return { route: 'blog-post', params: { slug: segments[1] } };
  if (segments[0] === 'tags' && segments.length === 1) return { route: 'tags', params: {} };
  if (segments[0] === 'tags' && segments[1] && segments[2] === 'page' && segments[3]) return { route: 'tag-page', params: { tag: segments[1], page: segments[3] } };
  if (segments[0] === 'tags' && segments[1]) return { route: 'tag', params: { tag: segments[1] } };
  if (segments[0] === 'archive' && segments.length === 1) return { route: 'archive', params: {} };
  if (segments[0] === 'archive' && segments[1] && segments[2] === 'page' && segments[3]) return { route: 'month-page', params: { month: segments[1], page: segments[3] } };
  if (segments[0] === 'archive' && segments[1]) return { route: 'month', params: { month: segments[1] } };
  if (segments[0] === 'search') return { route: 'search', params: {} };

  return { route: 'not-found', params: {} };
}

async function getRouteMetadata(locale: Locale, pathname: string): Promise<SiteMetadata> {
  const { route, params } = getRouteParams(pathname);

  switch (route) {
    case 'home':
      return homeMetadata;
    case 'about':
      return aboutMetadata;
    case 'blog':
      return blogMetadata;
    case 'blog-page':
      return generateBlogPageMetadata({ locale, params: { page: params.page } });
    case 'blog-post':
      return generateBlogPostMetadata({ locale, params: { slug: params.slug } });
    case 'tags':
      return tagsMetadata;
    case 'tag':
      return generateTagMetadata({ locale, params: { tag: params.tag } });
    case 'tag-page':
      return generateTagPageMetadata({ locale, params: { tag: params.tag, page: params.page } });
    case 'archive':
      return archiveMetadata;
    case 'month':
      return generateMonthMetadata({ locale, params: { month: params.month } });
    case 'month-page':
      return generateMonthPageMetadata({ locale, params: { month: params.month, page: params.page } });
    case 'search':
      return {
        ...(await generateSearchMetadata({ locale, searchParams: {} })),
        robots: { index: false, follow: true },
      };
    default:
      return { title: locale === 'en' ? "Page Not Found - Elecmonkey's Garden" : '页面未找到 - Elecmonkey的小花园', robots: 'noindex, nofollow' };
  }
}

async function getAvailableAlternateLinks(pathname: string): Promise<Array<{ hrefLang: string; href: string }>> {
  const pathnames = new Set(await getStaticPathnames());

  return getAlternateLinks(pathname).filter((alternate) => {
    const alternatePathname = alternate.href.replace(siteUrl, '') || '/';
    return pathnames.has(alternatePathname);
  });
}

function localizeRouteMetadata(locale: Locale, pathname: string, routeMetadata: SiteMetadata): SiteMetadata {
  if (locale !== 'en') {
    return routeMetadata;
  }

  const { route } = getRouteParams(pathname);
  const siteName = dictionaries.en.siteName;

  switch (route) {
    case 'home':
      return {
        ...routeMetadata,
        title: "Elecmonkey's Garden - Sounding the Heart's Voice",
        description: dictionaries.en.siteDescription,
        openGraph: {
          ...(routeMetadata.openGraph ?? {}),
          title: "Elecmonkey's Garden - Frontend Engineering Blog",
          description: dictionaries.en.siteDescription,
        },
      };
    case 'about':
      return { ...routeMetadata, title: `About - ${siteName}` };
    case 'blog':
      return { ...routeMetadata, title: `Posts - ${siteName}` };
    case 'blog-page':
    case 'blog-post':
      return routeMetadata;
    case 'tags':
      return { ...routeMetadata, title: `Tags - ${siteName}` };
    case 'tag':
    case 'tag-page':
      return routeMetadata;
    case 'archive':
      return { ...routeMetadata, title: `Archive - ${siteName}`, description: 'Browse posts by month' };
    case 'month':
    case 'month-page':
      return routeMetadata;
    case 'search':
      return { ...routeMetadata, title: `Search - ${siteName}`, description: 'Search posts' };
    default:
      return routeMetadata;
  }
}

export async function renderMetadataTags(pathname: string): Promise<string> {
  const locale = getLocaleFromPathname(pathname);
  const routeMetadata = localizeRouteMetadata(locale, pathname, await getRouteMetadata(locale, pathname));
  const metadata = mergeMetadata(createRootMetadata(locale), routeMetadata);
  const { route } = getRouteParams(pathname);
  const title = getTitle(metadata);
  const routeTitle = getTitle(routeMetadata);
  const canonicalUrl = getCanonicalUrl(pathname);
  const tags: string[] = [];

  if (title) tags.push(`<title>${escapeHtml(title)}</title>`);
  tags.push(linkTag({ rel: 'canonical', href: canonicalUrl }));
  for (const alternate of await getAvailableAlternateLinks(pathname)) {
    tags.push(linkTag({ rel: 'alternate', hrefLang: alternate.hrefLang, href: alternate.href }));
  }
  if (metadata.description) tags.push(metaTag('description', metadata.description));
  if (metadata.keywords) tags.push(metaTag('keywords', Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : metadata.keywords));
  if (metadata.creator) tags.push(metaTag('creator', metadata.creator));
  if (metadata.publisher) tags.push(metaTag('publisher', metadata.publisher));
  if (metadata.authors?.length) tags.push(metaTag('author', metadata.authors.map((author) => author.name).filter(Boolean).join(', ')));

  const robots = robotsToContent(metadata.robots);
  if (robots) tags.push(metaTag('robots', robots));
  const googleBot = googleBotToContent(metadata.robots);
  if (googleBot) tags.push(metaTag('googlebot', googleBot));

  const openGraph = metadata.openGraph ?? {};
  const routeOpenGraph = routeMetadata.openGraph ?? {};
  const ogTitle = routeOpenGraph.title ?? routeTitle ?? openGraph.title ?? title;
  const ogDescription = routeOpenGraph.description ?? routeMetadata.description ?? metadata.description ?? openGraph.description;
  const ogUrl = getUrlValue(routeOpenGraph.url, metadata) ?? canonicalUrl;
  const ogType = routeOpenGraph.type ?? (route === 'blog-post' ? 'article' : openGraph.type);

  if (ogType) tags.push(propertyTag('og:type', ogType));
  if (openGraph.locale) tags.push(propertyTag('og:locale', openGraph.locale));
  if (openGraph.siteName) tags.push(propertyTag('og:site_name', openGraph.siteName));
  if (ogTitle) tags.push(propertyTag('og:title', ogTitle));
  if (ogDescription) tags.push(propertyTag('og:description', ogDescription));
  tags.push(propertyTag('og:url', ogUrl));
  const ogImage = getFirstImage(metadata, routeOpenGraph.images ?? openGraph.images);
  if (ogImage) tags.push(propertyTag('og:image', ogImage));

  const twitter = metadata.twitter ?? {};
  const routeTwitter = routeMetadata.twitter ?? {};
  const twitterTitle = routeTwitter.title ?? routeTitle ?? twitter.title ?? title;
  const twitterDescription = routeTwitter.description ?? routeMetadata.description ?? metadata.description ?? twitter.description;

  if (twitter.card) tags.push(metaTag('twitter:card', twitter.card));
  if (twitterTitle) tags.push(metaTag('twitter:title', twitterTitle));
  if (twitterDescription) tags.push(metaTag('twitter:description', twitterDescription));
  const twitterImage = getFirstImage(metadata, routeTwitter.images ?? twitter.images);
  if (twitterImage) tags.push(metaTag('twitter:image', twitterImage));

  return tags.join('\n    ');
}
