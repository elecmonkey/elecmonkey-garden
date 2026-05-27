import { generatedPostLoaders, generatedPosts, generatedPublicPosts } from '@/generated/content';
import { calculateTagSizes } from './tag-size';

// 定义文章数据类型
export type PostData = {
  id: string;           // 文章唯一标识符
  content?: string;     // 文章内容（列表页只保留元数据，详情页按需加载）
  title: string;        // 文章标题
  date: string;         // 发布日期
  description: string;  // 文章描述
  tags: string[];       // 文章标签
  author: string;       // 文章作者
  monthFolder: string;  // 月份文件夹 (例如: "202403")
  isDraft?: boolean;    // 是否为草稿
  isHidden?: boolean;   // 是否为隐藏文章
  toc?: TocItem[];      // SSG 预生成目录
  [key: string]: unknown;
};

// 定义标签统计类型
export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export type TagCount = {
  name: string;     // 标签名称
  count: number;    // 出现次数
  size?: string;    // 标签大小（用于UI显示）
};

// 定义月份统计类型
export type MonthData = {
  id: string;       // 月份ID (例如: "202503")
  displayName: string; // 显示名称 (例如: "2025年5月")
  count: number;    // 文章数量
};

// 分页结果类型
export type PaginatedPosts = {
  posts: PostData[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

// 定义搜索结果类型
export type SearchResultItem = {
  post: PostData;
  score: number;
  matches: {
    title: boolean;
    tags: string[];
    description: boolean;
    content: {
      matched: boolean;
      excerpt: string;
    };
  };
};

type PostPathData = {
  params: {
    slug: string;
  };
  monthFolder: string;
};

type PostNavigation = {
  prevPost?: { id: string; title: string };
  nextPost?: { id: string; title: string };
};

const allPosts = generatedPosts as PostData[];
const publicPostsWithDrafts = generatedPublicPosts as PostData[];
const nonDraftPosts = allPosts.filter((post) => !post.isDraft);
const publicPosts = publicPostsWithDrafts.filter((post) => !post.isDraft);

const postById = new Map<string, PostData>();
const fullPostById = new Map<string, PostData>();
const publicPostIndexById = new Map<string, number>();
const postsByTag = new Map<string, PostData[]>();
const postsByMonth = new Map<string, PostData[]>();

const allPostIds: PostPathData[] = [];

declare global {
  interface Window {
    __GARDEN_INITIAL_POST__?: PostData;
  }
}

function readInitialPostFromDocument(id: string): PostData | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const existing = window.__GARDEN_INITIAL_POST__;
  if (existing?.id === id) {
    fullPostById.set(existing.id, existing);
    return existing;
  }

  const script = document.getElementById('__garden_initial_post__');
  if (script?.textContent) {
    try {
      const post = JSON.parse(script.textContent) as PostData;
      window.__GARDEN_INITIAL_POST__ = post;
      fullPostById.set(post.id, post);

      if (post.id === id) {
        return post;
      }
    } catch (error) {
      console.error('解析预加载文章失败:', error);
    }
  }

  return undefined;
}

for (const post of allPosts) {
  postById.set(post.id, post);
  allPostIds.push({
    params: {
      slug: post.id,
    },
    monthFolder: post.monthFolder,
  });
}

publicPosts.forEach((post, index) => {
  publicPostIndexById.set(post.id, index);

  for (const tag of post.tags) {
    const tagPosts = postsByTag.get(tag);
    if (tagPosts) {
      tagPosts.push(post);
    } else {
      postsByTag.set(tag, [post]);
    }
  }

  const monthPosts = postsByMonth.get(post.monthFolder);
  if (monthPosts) {
    monthPosts.push(post);
  } else {
    postsByMonth.set(post.monthFolder, [post]);
  }
});

const allTags = calculateTagSizes(
  Array.from(postsByTag, ([name, posts]) => ({
    name,
    count: posts.length,
  })).sort((a, b) => a.name.localeCompare(b.name)),
);

const allMonths = Array.from(postsByMonth, ([id, posts]) => {
  const year = id.substring(0, 4);
  const month = id.substring(4, 6);

  return {
    id,
    displayName: `${year}年${month}月`,
    count: posts.length,
  };
}).sort((a, b) => (a.id < b.id ? 1 : -1));

function getSourcePosts(options: { includeDrafts?: boolean; includeHidden?: boolean } = {}): PostData[] {
  const { includeDrafts = false, includeHidden = false } = options;

  if (includeDrafts && includeHidden) {
    return allPosts;
  }

  if (includeDrafts) {
    return publicPostsWithDrafts;
  }

  if (includeHidden) {
    return nonDraftPosts;
  }

  return publicPosts;
}

function paginateItems<T>(items: T[], page: number = 1, pageSize: number = 10): {
  posts: T[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
} {
  const totalPosts = items.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  const validPage = totalPosts <= pageSize ? 1 : Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    posts: totalPosts <= pageSize ? [...items] : items.slice(startIndex, endIndex),
    totalPosts,
    totalPages,
    currentPage: validPage,
    pageSize,
  };
}

// 获取所有博客文章数据（默认不包含草稿和隐藏文章）
export function getAllPosts(options: { includeDrafts?: boolean; includeHidden?: boolean } = {}): PostData[] {
  return [...getSourcePosts(options)];
}

// 获取所有标签及其计数
export function getAllTags(): TagCount[] {
  return allTags.map((tag) => ({ ...tag }));
}

// 根据标签名获取相关文章
export function getPostsByTag(tagName: string): PostData[] {
  return [...(postsByTag.get(tagName) ?? [])];
}

// 获取所有可能的文章 ID 和它们所在的月份文件夹
export function getAllPostIds(): PostPathData[] {
  return allPostIds.map((postId) => ({
    params: {
      slug: postId.params.slug,
    },
    monthFolder: postId.monthFolder,
  }));
}

// 根据 ID 和月份文件夹获取文章数据
export function getPostById(id: string): PostData & PostNavigation {
  const currentPost = fullPostById.get(id) ?? readInitialPostFromDocument(id) ?? postById.get(id);

  if (!currentPost) {
    throw new Error(`找不到ID为 "${id}" 的文章`);
  }

  if (currentPost.isDraft) {
    throw new Error('草稿文章不允许访问');
  }

  let prevPost: { id: string; title: string } | undefined;
  let nextPost: { id: string; title: string } | undefined;

  if (!currentPost.isHidden) {
    const currentIndex = publicPostIndexById.get(id);

    if (currentIndex !== undefined) {
      const previous = publicPosts[currentIndex + 1];
      const next = publicPosts[currentIndex - 1];

      prevPost = previous ? { id: previous.id, title: previous.title } : undefined;
      nextPost = next ? { id: next.id, title: next.title } : undefined;
    }
  }

  return {
    ...currentPost,
    prevPost,
    nextPost,
  };
}

export async function loadPostById(id: string): Promise<PostData & PostNavigation> {
  if (!fullPostById.has(id)) {
    const loader = generatedPostLoaders[id];

    if (!loader) {
      throw new Error(`找不到ID为 "${id}" 的文章`);
    }

    const { post } = await loader();
    fullPostById.set(id, post);
  }

  return getPostById(id);
}

export function getLoadedPostById(id: string): (PostData & PostNavigation) | undefined {
  if (!fullPostById.has(id)) {
    return undefined;
  }

  return getPostById(id);
}

// 获取所有月份及其文章数量
export function getAllMonths(): MonthData[] {
  return allMonths.map((month) => ({ ...month }));
}

// 根据月份获取相关文章
export function getPostsByMonth(month: string): PostData[] {
  return [...(postsByMonth.get(month) ?? [])];
}

// 获取分页的文章列表
export function getAllPostsWithPagination(page: number = 1, pageSize: number = 10): PaginatedPosts {
  return paginateItems(publicPosts, page, pageSize);
}

// 根据标签获取分页的文章列表
export function getPostsByTagWithPagination(tagName: string, page: number = 1, pageSize: number = 10): PaginatedPosts {
  return paginateItems(postsByTag.get(tagName) ?? [], page, pageSize);
}

// 根据月份获取分页的文章列表
export function getPostsByMonthWithPagination(month: string, page: number = 1, pageSize: number = 10): PaginatedPosts {
  return paginateItems(postsByMonth.get(month) ?? [], page, pageSize);
}

// 搜索文章
export function searchPosts(keyword: string): SearchResultItem[] {
  if (!keyword.trim()) {
    return [];
  }
  
  // 转换关键词为小写，用于不区分大小写的搜索
  const normalizedKeyword = keyword.toLowerCase();
  
  // 计算每篇文章的相关度得分
  const scoredPosts = publicPosts.map(post => {
    let score = 0;
    const matches = {
      title: false,
      tags: [] as string[],
      description: false,
      content: {
        matched: false,
        excerpt: "",
      }
    };
    
    const normalizedTitle = post.title.toLowerCase();

    // 标题匹配（权重最高）
    if (normalizedTitle.includes(normalizedKeyword)) {
      score += 10;
      matches.title = true;
      // 标题开头匹配得分更高
      if (normalizedTitle.startsWith(normalizedKeyword)) {
        score += 5;
      }
    }
    
    // 标签匹配（权重次高）
    post.tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      if (normalizedTag.includes(normalizedKeyword)) {
        score += 8;
        matches.tags.push(tag);
        // 精确匹配标签得分更高
        if (normalizedTag === normalizedKeyword) {
          score += 5;
        }
      }
    });
    
    // 描述匹配（中等权重）
    if (post.description) {
      const normalizedDescription = post.description.toLowerCase();
      if (normalizedDescription.includes(normalizedKeyword)) {
        score += 5;
        matches.description = true;
      }
    }
    
    // 内容匹配（基础权重）
    if (post.content) {
      const normalizedContent = post.content.toLowerCase();
      if (normalizedContent.includes(normalizedKeyword)) {
        score += 3;
        matches.content.matched = true;
        
        // 计算关键词在内容中出现的次数
        const matchCount = normalizedContent.split(normalizedKeyword).length - 1;
        // 出现次数也计入得分，但设置上限以避免过度权重
        score += Math.min(matchCount, 5) * 0.5;
        
        // 提取匹配的上下文作为摘要
        try {
          const keywordIndex = normalizedContent.indexOf(normalizedKeyword);
          if (keywordIndex !== -1) {
            // 获取关键词前后一定长度的内容作为摘要
            const startIndex = Math.max(0, keywordIndex - 50);
            const endIndex = Math.min(normalizedContent.length, keywordIndex + normalizedKeyword.length + 50);
            let excerpt = post.content.substring(startIndex, endIndex);
            
            // 如果摘要不是从内容开头开始，添加省略号
            if (startIndex > 0) {
              excerpt = "..." + excerpt;
            }
            
            // 如果摘要不是到内容结尾，添加省略号
            if (endIndex < post.content.length) {
              excerpt = excerpt + "...";
            }
            
            matches.content.excerpt = excerpt;
          }
        } catch (error) {
          console.error("提取摘要时出错:", error);
          matches.content.excerpt = post.description;
        }
      }
    }
    
    // 日期因素（新文章略微提升）- 只有在至少有一个匹配时才考虑日期因素
    const hasMatches = matches.title || matches.description || matches.content.matched || matches.tags.length > 0;
    
    if (hasMatches) {
      const dateScore = new Date(post.date).getTime() / (1000 * 60 * 60 * 24) / 100;
      score += dateScore;
    }
    
    return { post, score, matches };
  });
  
  // 过滤掉没有匹配项的文章
  const matchedPosts = scoredPosts.filter(item => 
    item.matches.title || 
    item.matches.description || 
    item.matches.content.matched || 
    item.matches.tags.length > 0
  );
  
  // 按得分降序排序
  matchedPosts.sort((a, b) => b.score - a.score);
  
  // 返回排序后的文章数组及匹配信息
  return matchedPosts;
}

// 搜索文章并分页
export function searchPostsWithPagination(keyword: string, page: number = 1, pageSize: number = 10): {
  posts: SearchResultItem[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
} {
  return paginateItems(searchPosts(keyword), page, pageSize);
}
