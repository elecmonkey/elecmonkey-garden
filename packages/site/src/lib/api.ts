import { generatedPosts, generatedPublicPosts } from '@/generated/content';

// 定义文章数据类型
export type PostData = {
  id: string;           // 文章唯一标识符
  content: string;      // 文章内容
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

function sortPosts(posts: PostData[]): PostData[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function getSourcePosts(options: { includeDrafts?: boolean; includeHidden?: boolean } = {}): PostData[] {
  const { includeHidden = false } = options;
  return includeHidden ? generatedPosts : generatedPublicPosts;
}

// 获取所有博客文章数据（默认不包含草稿和隐藏文章）
export function getAllPosts(options: { includeDrafts?: boolean; includeHidden?: boolean } = {}): PostData[] {
  return sortPosts(getSourcePosts(options));
}

// 获取所有标签及其计数
export function getAllTags(): TagCount[] {
  // 只获取非草稿、非隐藏文章的标签
  const posts = getAllPosts({ includeDrafts: false, includeHidden: false });
  const tagCount: Record<string, number> = {};
  
  // 统计每个标签出现的次数
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  
  // 转换为数组并按标签名称字母顺序排序
  const tags = Object.entries(tagCount)
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // 计算标签大小
  return calculateTagSizes(tags);
}

// 根据标签名获取相关文章
export function getPostsByTag(tagName: string): PostData[] {
  // 只获取非草稿、非隐藏文章
  const allPosts = getAllPosts({ includeDrafts: false, includeHidden: false });
  return allPosts.filter(post => post.tags.includes(tagName));
}

// 计算标签云的标签大小
function calculateTagSizes(tags: TagCount[]): TagCount[] {
  // 找出最大和最小出现次数
  const maxCount = Math.max(...tags.map(tag => tag.count));
  const minCount = Math.min(...tags.map(tag => tag.count));
  
  // 定义最小和最大字体大小
  const minSize = 0.8;  // em
  const maxSize = 2;    // em
  
  // 为每个标签计算相对大小
  return tags.map(tag => {
    // 如果只有一个标签或所有标签出现次数相同
    if (maxCount === minCount) {
      return { ...tag, size: `${(minSize + maxSize) / 2}em` };
    }
    
    // 线性映射 count 到 size
    const size = minSize + ((tag.count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
    return { ...tag, size: `${size.toFixed(2)}em` };
  });
}

// 获取所有可能的文章 ID 和它们所在的月份文件夹
export function getAllPostIds() {
  return generatedPosts.map((post) => ({
    params: {
      slug: post.id,
    },
    monthFolder: post.monthFolder,
  }));
}

// 根据 ID 和月份文件夹获取文章数据
export function getPostById(id: string): PostData & { prevPost?: { id: string; title: string }; nextPost?: { id: string; title: string } } {
  const currentPost = generatedPosts.find((post) => post.id === id);

  if (!currentPost) {
    throw new Error(`找不到ID为 "${id}" 的文章`);
  }

  if (currentPost.isDraft) {
    throw new Error('草稿文章不允许访问');
  }

  let prevPost: { id: string; title: string } | undefined;
  let nextPost: { id: string; title: string } | undefined;

  if (!currentPost.isHidden) {
    const allPublicPosts = sortPosts(generatedPublicPosts);
    const currentIndex = allPublicPosts.findIndex((post) => post.id === id);

    prevPost = currentIndex < allPublicPosts.length - 1
      ? { id: allPublicPosts[currentIndex + 1].id, title: allPublicPosts[currentIndex + 1].title }
      : undefined;

    nextPost = currentIndex > 0
      ? { id: allPublicPosts[currentIndex - 1].id, title: allPublicPosts[currentIndex - 1].title }
      : undefined;
  }

  return {
    ...currentPost,
    prevPost,
    nextPost,
  };
}

// 获取所有月份及其文章数量
export function getAllMonths(): MonthData[] {
  // 只统计非草稿、非隐藏文章的月份
  const posts = getAllPosts({ includeDrafts: false, includeHidden: false });
  const monthCount: Record<string, number> = {};
  
  // 统计每个月份的文章数量
  posts.forEach(post => {
    monthCount[post.monthFolder] = (monthCount[post.monthFolder] || 0) + 1;
  });
  
  // 转换为数组形式
  const monthsData = Object.entries(monthCount)
    .map(([id, count]) => {
      // 转换月份格式: YYYYMM -> YYYY年MM月
      const year = id.substring(0, 4);
      const month = id.substring(4, 6);
      const displayName = `${year}年${month}月`;
      
      return {
        id,
        displayName,
        count
      };
    });
  
  // 按月份降序排列（最新的月份在前）
  return monthsData.sort((a, b) => {
    if (a.id < b.id) {
      return 1;
    } else {
      return -1;
    }
  });
}

// 根据月份获取相关文章
export function getPostsByMonth(month: string): PostData[] {
  const posts = generatedPublicPosts.filter((post) => post.monthFolder === month);
  return sortPosts(posts);
}

// 获取分页的文章列表
export function getAllPostsWithPagination(page: number = 1, pageSize: number = 10): PaginatedPosts {
  // 只获取非草稿、非隐藏文章
  const allPosts = getAllPosts({ includeDrafts: false, includeHidden: false });
  const totalPosts = allPosts.length;
  
  // 如果文章总数少于或等于每页数量，则不分页
  if (totalPosts <= pageSize) {
    return {
      posts: allPosts,
      totalPosts,
      totalPages: 1, // 总是至少有1页
      currentPage: 1,
      pageSize,
    };
  }
  
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  
  // 确保页码在有效范围内
  const validPage = Math.max(1, Math.min(page, totalPages));
  
  // 计算当前页的文章
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPagePosts = allPosts.slice(startIndex, endIndex);
  
  return {
    posts: currentPagePosts,
    totalPosts,
    totalPages,
    currentPage: validPage,
    pageSize,
  };
}

// 根据标签获取分页的文章列表
export function getPostsByTagWithPagination(tagName: string, page: number = 1, pageSize: number = 10): PaginatedPosts {
  // 获取包含该标签的所有非草稿、非隐藏文章
  const allPosts = getPostsByTag(tagName);
  const totalPosts = allPosts.length;
  
  // 如果文章总数少于或等于每页数量，则不分页
  if (totalPosts <= pageSize) {
    return {
      posts: allPosts,
      totalPosts,
      totalPages: 1, // 总是至少有1页
      currentPage: 1,
      pageSize,
    };
  }
  
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  
  // 确保页码在有效范围内
  const validPage = Math.max(1, Math.min(page, totalPages));
  
  // 计算当前页的文章
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPagePosts = allPosts.slice(startIndex, endIndex);
  
  return {
    posts: currentPagePosts,
    totalPosts,
    totalPages,
    currentPage: validPage,
    pageSize,
  };
}

// 根据月份获取分页的文章列表
export function getPostsByMonthWithPagination(month: string, page: number = 1, pageSize: number = 10): PaginatedPosts {
  // 获取该月份的所有非草稿、非隐藏文章
  const allPosts = getPostsByMonth(month);
  const totalPosts = allPosts.length;
  
  // 如果文章总数少于或等于每页数量，则不分页
  if (totalPosts <= pageSize) {
    return {
      posts: allPosts,
      totalPosts,
      totalPages: 1, // 总是至少有1页
      currentPage: 1,
      pageSize,
    };
  }
  
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  
  // 确保页码在有效范围内
  const validPage = Math.max(1, Math.min(page, totalPages));
  
  // 计算当前页的文章
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPagePosts = allPosts.slice(startIndex, endIndex);
  
  return {
    posts: currentPagePosts,
    totalPosts,
    totalPages,
    currentPage: validPage,
    pageSize,
  };
}

// 搜索文章
export function searchPosts(keyword: string): SearchResultItem[] {
  if (!keyword.trim()) {
    return [];
  }
  
  // 只搜索非草稿、非隐藏文章
  const allPosts = getAllPosts({ includeDrafts: false, includeHidden: false });
  
  // 转换关键词为小写，用于不区分大小写的搜索
  const normalizedKeyword = keyword.toLowerCase();
  
  // 计算每篇文章的相关度得分
  const scoredPosts = allPosts.map(post => {
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
    
    // 标题匹配（权重最高）
    if (post.title.toLowerCase().includes(normalizedKeyword)) {
      score += 10;
      matches.title = true;
      // 标题开头匹配得分更高
      if (post.title.toLowerCase().startsWith(normalizedKeyword)) {
        score += 5;
      }
    }
    
    // 标签匹配（权重次高）
    post.tags.forEach(tag => {
      if (tag.toLowerCase().includes(normalizedKeyword)) {
        score += 8;
        matches.tags.push(tag);
        // 精确匹配标签得分更高
        if (tag.toLowerCase() === normalizedKeyword) {
          score += 5;
        }
      }
    });
    
    // 描述匹配（中等权重）
    if (post.description && post.description.toLowerCase().includes(normalizedKeyword)) {
      score += 5;
      matches.description = true;
    }
    
    // 内容匹配（基础权重）
    if (post.content && post.content.toLowerCase().includes(normalizedKeyword)) {
      score += 3;
      matches.content.matched = true;
      
      // 计算关键词在内容中出现的次数
      const matchCount = post.content.toLowerCase().split(normalizedKeyword).length - 1;
      // 出现次数也计入得分，但设置上限以避免过度权重
      score += Math.min(matchCount, 5) * 0.5;
      
      // 提取匹配的上下文作为摘要
      try {
        const lowerContent = post.content.toLowerCase();
        const keywordIndex = lowerContent.indexOf(normalizedKeyword);
        if (keywordIndex !== -1) {
          // 获取关键词前后一定长度的内容作为摘要
          const startIndex = Math.max(0, keywordIndex - 50);
          const endIndex = Math.min(lowerContent.length, keywordIndex + normalizedKeyword.length + 50);
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
  // 获取搜索结果
  const allResults = searchPosts(keyword);
  const totalPosts = allResults.length;
  
  // 如果搜索结果总数少于或等于每页数量，则不分页
  if (totalPosts <= pageSize) {
    return {
      posts: allResults,
      totalPosts,
      totalPages: 1, // 总是至少有1页
      currentPage: 1,
      pageSize,
    };
  }
  
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  
  // 确保页码在有效范围内
  const validPage = Math.max(1, Math.min(page, totalPages));
  
  // 计算当前页的文章
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageResults = allResults.slice(startIndex, endIndex);
  
  return {
    posts: currentPageResults,
    totalPosts,
    totalPages,
    currentPage: validPage,
    pageSize,
  };
}