import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// 定义文章数据类型
type PostData = {
  id: string;           // 文章唯一标识符
  content: string;      // 文章内容
  title: string;        // 文章标题
  date: string;         // 发布日期
  description: string;  // 文章描述
  tags: string[];       // 文章标签
  author: string;       // 文章作者
  monthFolder: string;  // 月份文件夹 (例如: "202403")
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

// 博客文章根目录路径
const postsDirectory = path.join(process.cwd(), 'src/content/posts');

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
async function getPostsFromMonth(monthFolder: string): Promise<PostData[]> {
  const monthPath = path.join(postsDirectory, monthFolder);
  
  try {
    const fileNames = await fs.readdir(monthPath);
    
    const postsPromises = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async (fileName) => {
        // 去掉文件名中的 .md 后缀，将其作为 ID
        const id = fileName.replace(/\.md$/, '');
        
        // 读取 markdown 文件内容
        const fullPath = path.join(monthPath, fileName);
        const fileContents = await fs.readFile(fullPath, 'utf8');
        
        // 使用 gray-matter 解析文章元数据
        const { data, content } = matter(fileContents);
        
        // 将数据与 id、content 和 monthFolder 合并
        return {
          id,
          content,
          monthFolder,
          ...data as Omit<PostData, 'id' | 'content' | 'monthFolder'>,
        } as PostData;
      });
    
    return await Promise.all(postsPromises);
  } catch (error) {
    console.error(`获取月份 ${monthFolder} 的文章出错:`, error);
    return [];
  }
}

// 获取所有博客文章数据
export async function getAllPosts(): Promise<PostData[]> {
  const monthFolders = await getMonthFolders();
  const allPostsPromises = monthFolders.map(getPostsFromMonth);
  const monthPosts = await Promise.all(allPostsPromises);
  
  // 合并所有月份的文章并按日期排序
  const allPosts = monthPosts.flat();
  
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
  const posts = await getAllPosts();
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
  const allPosts = await getAllPosts();
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
        .map(fileName => {
          const slug = fileName.replace(/\.md$/, '');
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
    const fullPath = path.join(postsDirectory, monthFolder, `${id}.md`);
    
    try {
      // 检查文件是否存在
      await fs.access(fullPath);
      
      // 文件存在，读取内容
      const fileContents = await fs.readFile(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      
      currentPost = {
        id,
        content,
        monthFolder,
        ...data as Omit<PostData, 'id' | 'content' | 'monthFolder'>,
      } as PostData;
      
      break; // 找到文章，跳出循环
    } catch {
      // 文件不存在，继续检查下一个月份文件夹
      continue;
    }
  }
  
  // 如果没有找到文章，抛出错误
  if (!currentPost) {
    throw new Error(`找不到ID为 "${id}" 的文章`);
  }
  
  // 获取所有文章，用于确定前后文章
  const allPosts = await getAllPosts();
  
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
  const monthFolders = await getMonthFolders();
  const monthDataPromises = monthFolders.map(async (monthFolder) => {
    // 获取该月份的文章数量
    const postsInMonth = await getPostsFromMonth(monthFolder);
    
    // 转换月份格式: YYYYMM -> YYYY年MM月
    const year = monthFolder.substring(0, 4);
    const month = monthFolder.substring(4, 6);
    const displayName = `${year}年${month}月`;
    
    return {
      id: monthFolder,
      displayName,
      count: postsInMonth.length
    };
  });
  
  const monthsData = await Promise.all(monthDataPromises);
  
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
    const posts = await getPostsFromMonth(month);
    
    // 按日期降序排列
    return posts.sort((a, b) => {
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