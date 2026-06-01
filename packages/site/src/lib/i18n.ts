export type Locale = 'zh' | 'en';

export const defaultLocale: Locale = 'zh';
export const locales = ['zh', 'en'] as const;

export const localeLabels: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getLocalePrefix(locale: Locale): '' | '/en' {
  return locale === 'en' ? '/en' : '';
}

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : defaultLocale;
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice('/en'.length) || '/';
  return pathname || '/';
}

export function withLocalePath(pathname: string, locale: Locale): string {
  const stripped = stripLocalePrefix(pathname).replace(/\/+/g, '/');
  const normalized = stripped.startsWith('/') ? stripped : `/${stripped}`;
  const prefix = getLocalePrefix(locale);

  if (!prefix) {
    return normalized;
  }

  return normalized === '/' ? prefix : `${prefix}${normalized}`;
}

export function hrefFor(locale: Locale, pathname: string): string {
  return withLocalePath(pathname, locale);
}

export function postHref(locale: Locale, slug: string): string {
  return hrefFor(locale, `/blog/${slug}`);
}

export function archiveHref(locale: Locale, month: string): string {
  return hrefFor(locale, `/archive/${month}`);
}

export const dictionaries = {
  zh: {
    loading: '正在加载页面...',
    siteName: 'Elecmonkey的小花园',
    siteDescription: '专注于前端技术的技术博客，分享前端开发经验、工程化实践和最佳实践',
    nav: {
      home: '首页',
      blog: '所有文章',
      about: '关于我',
      search: '搜索',
    },
  },
  en: {
    loading: 'Loading page...',
    siteName: "Elecmonkey's Garden",
    siteDescription: 'A frontend engineering blog about JavaScript, TypeScript, React, Vue, tooling, performance, and architecture.',
    nav: {
      home: 'Home',
      blog: 'Posts',
      about: 'About',
      search: 'Search',
    },
  },
} satisfies Record<Locale, {
  loading: string;
  siteName: string;
  siteDescription: string;
  nav: {
    home: string;
    blog: string;
    about: string;
    search: string;
  };
}>;
