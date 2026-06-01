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
    common: {
      home: '主页',
      allPosts: '所有文章',
      viewAllPosts: '查看所有文章',
      noPosts: '暂无文章，请稍后再来！',
      postCount: (count: number) => `${count} 篇文章`,
      previousPage: '上一页',
      nextPage: '下一页',
    },
    home: {
      garden: '小花园',
      totalPosts: '文章总数',
      latestUpdate: '最新更新',
      tagCloud: '标签云',
      allTags: '所有标签',
    },
    blog: {
      title: '博客文章',
      monthlyArchive: '按月归档',
    },
    tags: {
      title: '所有标签',
      sortedByCount: '按文章数量排序',
      hint: '点击标签查看相关文章',
      noPosts: '未找到带有此标签的文章',
    },
    archive: {
      title: '文章归档',
      sortedByTime: '按时间排序',
      noPosts: '暂无文章',
      monthHint: '点击月份查看相关文章',
      allArchives: '所有归档',
      noPostsInMonth: '该月份未找到文章',
      postUnit: '篇',
    },
    search: {
      title: '搜索',
      emptyPlaceholder: '输入关键词搜索文章...',
      placeholder: '搜索文章...',
      enterKeyword: '请输入关键词进行搜索',
      loadError: '搜索索引加载失败，请稍后重试',
      loading: '正在加载搜索索引...',
      resultPrefix: '找到',
      resultMiddle: '篇与',
      resultSuffix: '相关的文章',
      noResults: '未找到相关文章',
      matchedIn: '匹配位置:',
      fields: {
        title: '标题',
        description: '描述',
        content: '内容',
        tags: '标签',
      },
    },
    about: {
      techWallLine1: '很多我很想玩明白但完全玩不明白的东西。',
      techWallLine2: '但没关系，时间还多。',
      expand: '展开',
      collapse: '收起',
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
    common: {
      home: 'Home',
      allPosts: 'All Posts',
      viewAllPosts: 'View All Posts',
      noPosts: 'No posts yet. Please check back later.',
      postCount: (count: number) => `${count} ${count === 1 ? 'post' : 'posts'}`,
      previousPage: 'Previous',
      nextPage: 'Next',
    },
    home: {
      garden: 'Garden',
      totalPosts: 'Total Posts',
      latestUpdate: 'Latest Update',
      tagCloud: 'Tag Cloud',
      allTags: 'All Tags',
    },
    blog: {
      title: 'Blog Posts',
      monthlyArchive: 'Monthly Archive',
    },
    tags: {
      title: 'All Tags',
      sortedByCount: 'Sorted by post count',
      hint: 'Click a tag to view related posts',
      noPosts: 'No posts found for this tag.',
    },
    archive: {
      title: 'Archive',
      sortedByTime: 'Sorted by time',
      noPosts: 'No posts yet.',
      monthHint: 'Click a month to view related posts',
      allArchives: 'All Archives',
      noPostsInMonth: 'No posts found for this month.',
      postUnit: 'posts',
    },
    search: {
      title: 'Search',
      emptyPlaceholder: 'Enter keywords to search posts...',
      placeholder: 'Search posts...',
      enterKeyword: 'Enter keywords to search.',
      loadError: 'Failed to load the search index. Please try again later.',
      loading: 'Loading search index...',
      resultPrefix: 'Found',
      resultMiddle: 'posts matching',
      resultSuffix: '',
      noResults: 'No related posts found.',
      matchedIn: 'Matched in:',
      fields: {
        title: 'Title',
        description: 'Description',
        content: 'Content',
        tags: 'Tags',
      },
    },
    about: {
      techWallLine1: 'So many things I want to understand, and still completely fail to understand.',
      techWallLine2: 'That is fine. There is still time.',
      expand: 'Expand',
      collapse: 'Collapse',
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
  common: {
    home: string;
    allPosts: string;
    viewAllPosts: string;
    noPosts: string;
    postCount: (count: number) => string;
    previousPage: string;
    nextPage: string;
  };
  home: {
    garden: string;
    totalPosts: string;
    latestUpdate: string;
    tagCloud: string;
    allTags: string;
  };
  blog: {
    title: string;
    monthlyArchive: string;
  };
  tags: {
    title: string;
    sortedByCount: string;
    hint: string;
    noPosts: string;
  };
  archive: {
    title: string;
    sortedByTime: string;
    noPosts: string;
    monthHint: string;
    allArchives: string;
    noPostsInMonth: string;
    postUnit: string;
  };
  search: {
    title: string;
    emptyPlaceholder: string;
    placeholder: string;
    enterKeyword: string;
    loadError: string;
    loading: string;
    resultPrefix: string;
    resultMiddle: string;
    resultSuffix: string;
    noResults: string;
    matchedIn: string;
    fields: {
      title: string;
      description: string;
      content: string;
      tags: string;
    };
  };
  about: {
    techWallLine1: string;
    techWallLine2: string;
    expand: string;
    collapse: string;
  };
}>;
