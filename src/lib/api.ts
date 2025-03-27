import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

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
  [key: string]: unknown;
};

// 定义标签统计类型
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

// 博客文章根目录路径
const postsDirectory = path.join(process.cwd(), 'src/content/posts');

// 文章状态常量
const DRAFT_PREFIX = 'draft-';
const HIDDEN_PREFIX = 'hidden-';

// 检查文件名是否为草稿
function isDraftFile(fileName: string): boolean {
  return fileName.startsWith(DRAFT_PREFIX);
}

// 检查文件名是否为隐藏文章
function isHiddenFile(fileName: string): boolean {
  return fileName.startsWith(HIDDEN_PREFIX);
}

// 从文件名中提取真实ID
function extractIdFromFileName(fileName: string): string {
  let id = fileName.replace(/\.md$/, '');
  if (id.startsWith(DRAFT_PREFIX)) {
    id = id.substring(DRAFT_PREFIX.length);
  } else if (id.startsWith(HIDDEN_PREFIX)) {
    id = id.substring(HIDDEN_PREFIX.length);
  }
  return id;
}

// 获取所有月份文件夹
async function getMonthFolders(): Promise<string[]> {
  try {
    const entries = await fs.readdir(postsDirectory, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .filter(entry => /^\d{6}$/.test(entry.name)) // 只包括符合YYYYMM格式的文件夹
      .map(entry => entry.name)
      .sort()
      .reverse(); // 按月份倒序排列
  } catch (error) {
    console.error('获取月份文件夹出错:', error);
    return [];
  }
}

// 获取指定月份文件夹中的所有文章
async function getPostsFromMonth(monthFolder: string, includeDrafts: boolean = false): Promise<PostData[]> {
  const monthPath = path.join(postsDirectory, monthFolder);
  
  try {
    const fileNames = await fs.readdir(monthPath);
    
    const postsPromises = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .filter(fileName => includeDrafts || !isDraftFile(fileName)) // 根据includeDrafts决定是否过滤草稿
      .map(async (fileName) => {
        // 检查文件类型
        const isDraft = isDraftFile(fileName);
        const isHidden = isHiddenFile(fileName);
        
        // 提取真实ID
        const id = extractIdFromFileName(fileName);
        
        // 读取 markdown 文件内容
        const fullPath = path.join(monthPath, fileName);
        const fileContents = await fs.readFile(fullPath, 'utf8');
        
        // 使用 gray-matter 解析文章元数据
        const { data, content } = matter(fileContents);
        
        // 将数据与 id、content、monthFolder 以及文章状态合并
        return {
          id,
          content,
          monthFolder,
          isDraft,
          isHidden,
          ...data as Omit<PostData, 'id' | 'content' | 'monthFolder' | 'isDraft' | 'isHidden'>,
        } as PostData;
      });
    
    return await Promise.all(postsPromises);
  } catch (error) {
    console.error(`获取月份 ${monthFolder} 的文章出错:`, error);
    return [];
  }
}

// 获取所有博客文章数据（默认不包含草稿和隐藏文章）
export async function getAllPosts(options: { includeDrafts?: boolean; includeHidden?: boolean } = {}): Promise<PostData[]> {
  const { includeDrafts = false, includeHidden = false } = options;
  
  const monthFolders = await getMonthFolders();
  const allPostsPromises = monthFolders.map(folder => getPostsFromMonth(folder, includeDrafts));
  const monthPosts = await Promise.all(allPostsPromises);
  
  // 合并所有月份的文章
  let allPosts = monthPosts.flat();
  
  // 过滤隐藏文章（如果不包含）
  if (!includeHidden) {
    allPosts = allPosts.filter(post => !post.isHidden);
  }
  
  // 按日期排序
  return allPosts.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// 获取所有标签及其计数
export async function getAllTags(): Promise<TagCount[]> {
  // 只获取非草稿、非隐藏文章的标签
  const posts = await getAllPosts({ includeDrafts: false, includeHidden: false });
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
export async function getPostsByTag(tagName: string): Promise<PostData[]> {
  // 只获取非草稿、非隐藏文章
  const allPosts = await getAllPosts({ includeDrafts: false, includeHidden: false });
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
export async function getAllPostIds() {
  const monthFolders = await getMonthFolders();
  const allPostsIdPromises = monthFolders.map(async (monthFolder) => {
    const monthPath = path.join(postsDirectory, monthFolder);
    try {
      const fileNames = await fs.readdir(monthPath);
      return fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .filter(fileName => !isDraftFile(fileName)) // 过滤掉草稿文章，但保留隐藏文章
        .map(fileName => {
          // 提取真实ID
          const slug = extractIdFromFileName(fileName);
          
          return {
            params: {
              slug,
            },
            // 将 monthFolder 作为元数据而不是路由参数
            monthFolder,
          };
        });
    } catch (error) {
      console.error(`获取月份 ${monthFolder} 的文章ID出错:`, error);
      return [];
    }
  });
  
  const monthPostsIds = await Promise.all(allPostsIdPromises);
  return monthPostsIds.flat();
}

// 根据 ID 和月份文件夹获取文章数据
export async function getPostById(id: string): Promise<PostData & { prevPost?: { id: string; title: string }; nextPost?: { id: string; title: string } }> {
  // 尝试在各个月份文件夹中查找文章
  const monthFolders = await getMonthFolders();
  let currentPost: PostData | null = null;
  
  // 查找当前文章
  for (const monthFolder of monthFolders) {
    const monthPath = path.join(postsDirectory, monthFolder);
    
    try {
      // 获取月份目录中的文件
      const files = await fs.readdir(monthPath);
      
      // 尝试查找匹配的文件（包括草稿和隐藏文件）
      const matchingFile = files.find(file => {
        const fileId = extractIdFromFileName(file);
        return fileId === id && file.endsWith('.md');
      });
      
      if (matchingFile) {
        // 检查是否为草稿文章，如果是则直接拒绝访问
        if (isDraftFile(matchingFile)) {
          throw new Error('草稿文章不允许访问');
        }
        
        // 读取文件内容
        const fullPath = path.join(monthPath, matchingFile);
        const fileContents = await fs.readFile(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        
        // 确定文章状态
        const isDraft = false; // 前面已经拒绝了草稿访问
        const isHidden = isHiddenFile(matchingFile);
        
        currentPost = {
          id,
          content,
          monthFolder,
          isDraft,
          isHidden,
          ...data as Omit<PostData, 'id' | 'content' | 'monthFolder' | 'isDraft' | 'isHidden'>,
        } as PostData;
        
        break; // 找到文章，跳出循环
      }
    } catch (error) {
      console.error(`在 ${monthFolder} 中查找文章 ${id} 时出错:`, error);
      continue;
    }
  }
  
  // 如果没有找到文章，抛出错误
  if (!currentPost) {
    throw new Error(`找不到ID为 "${id}" 的文章`);
  }
  
  // 获取所有非草稿文章，用于确定前后文章
  const allPosts = await getAllPosts({ includeHidden: true }); // 允许隐藏文章有前后文章
  
  // 找到当前文章在所有文章中的索引
  const currentIndex = allPosts.findIndex(post => post.id === id);
  
  // 确定上一篇和下一篇文章（如果存在）
  // 注意：由于文章是按日期降序排序的，所以索引+1是较旧的文章（上一篇），索引-1是较新的文章（下一篇）
  const prevPost = currentIndex < allPosts.length - 1 ? 
    { id: allPosts[currentIndex + 1].id, title: allPosts[currentIndex + 1].title } : 
    undefined;
  
  const nextPost = currentIndex > 0 ? 
    { id: allPosts[currentIndex - 1].id, title: allPosts[currentIndex - 1].title } : 
    undefined;
  
  // 返回增强的文章数据，包含前后文章信息
  return {
    ...currentPost,
    prevPost,
    nextPost
  };
}

// 获取所有月份及其文章数量
export async function getAllMonths(): Promise<MonthData[]> {
  // 只统计非草稿、非隐藏文章的月份
  const posts = await getAllPosts({ includeDrafts: false, includeHidden: false });
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
export async function getPostsByMonth(month: string): Promise<PostData[]> {
  try {
    // 获取指定月份的所有非草稿文章
    const posts = await getPostsFromMonth(month, false);
    
    // 过滤掉隐藏文章
    const visiblePosts = posts.filter(post => !post.isHidden);
    
    // 按日期降序排列
    return visiblePosts.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    console.error(`获取月份 ${month} 的文章失败:`, error);
    return [];
  }
}

// 获取分页的文章列表
export async function getAllPostsWithPagination(page: number = 1, pageSize: number = 10): Promise<PaginatedPosts> {
  // 只获取非草稿、非隐藏文章
  const allPosts = await getAllPosts({ includeDrafts: false, includeHidden: false });
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
export async function getPostsByTagWithPagination(tagName: string, page: number = 1, pageSize: number = 10): Promise<PaginatedPosts> {
  // 获取包含该标签的所有非草稿、非隐藏文章
  const allPosts = await getPostsByTag(tagName);
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
export async function getPostsByMonthWithPagination(month: string, page: number = 1, pageSize: number = 10): Promise<PaginatedPosts> {
  // 获取该月份的所有非草稿、非隐藏文章
  const allPosts = await getPostsByMonth(month);
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
export async function searchPosts(keyword: string): Promise<SearchResultItem[]> {
  if (!keyword.trim()) {
    return [];
  }
  
  // 只搜索非草稿、非隐藏文章
  const allPosts = await getAllPosts({ includeDrafts: false, includeHidden: false });
  
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
    if (post.description.toLowerCase().includes(normalizedKeyword)) {
      score += 5;
      matches.description = true;
    }
    
    // 内容匹配（基础权重）
    if (post.content.toLowerCase().includes(normalizedKeyword)) {
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
export async function searchPostsWithPagination(keyword: string, page: number = 1, pageSize: number = 10): Promise<{
  posts: SearchResultItem[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}> {
  // 获取搜索结果
  const allResults = await searchPosts(keyword);
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