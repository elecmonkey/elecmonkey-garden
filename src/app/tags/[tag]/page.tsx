import { Metadata } from 'next';
import { getAllTags, getPostsByTagWithPagination } from '@/lib/api';
import PageContainer from '@/components/PageContainer';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import PageTransition from '@/components/PageTransition';
import { Suspense } from 'react';
import ScrollToContent from '@/components/ScrollToContent';
import { notFound } from 'next/navigation';
import { PostData } from '@/lib/api';

type Props = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 预生成所有标签及其分页的静态路径
export async function generateStaticParams() {
  const tags = await getAllTags();
  const params = [];
  
  // 为每个标签生成参数
  for (const tag of tags) {
    // 获取该标签的所有文章，计算总页数
    const { totalPages } = await getPostsByTagWithPagination(tag.name, 1);
    
    // 为每个标签的第1页生成参数（不带page参数）
    params.push({ tag: tag.name });
    
    // 为每个标签的所有其他页生成参数
    for (let page = 2; page <= totalPages; page++) {
      params.push({ 
        tag: tag.name,
        searchParams: { page: page.toString() }
      });
    }
  }
  
  return params;
}

// 为每个标签页生成元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  return {
    title: `#${decodedTag} - Elecmonkey的小花园`,
    description: `查看所有与 ${decodedTag} 相关的文章`,
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const searchParamsWait = await searchParams;
  // 获取当前页码，默认为第1页
  const currentPage = Number(searchParamsWait.page) || 1;
  
  // 获取分页的文章列表
  const { posts, totalPosts, totalPages } = await getPostsByTagWithPagination(decodedTag, currentPage);
  
  // 如果页码超出范围且总页数大于0，返回404
  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }
  
  return (
    <PageContainer>
      {/* 添加滚动处理组件，用 Suspense 包裹 */}
      <Suspense fallback={null}>
        <ScrollToContent />
      </Suspense>
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-2 text-gray-700 dark:text-gray-300">#</span>
            {decodedTag}
            <span className="ml-3 text-lg font-normal text-gray-500">({totalPosts} 篇文章)</span>
          </h1>
          <div className="flex gap-2">
            <Link 
              href="/" 
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              主页
            </Link>
            <Link 
              href="/tags" 
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              所有标签
            </Link>
          </div>
        </div>
      </div>
      
      <PageTransition>
        {posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">未找到带有此标签的文章</p>
            <Link href="/blog" className="text-blue-600 hover:underline mt-4 inline-block">
              查看所有文章
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post: PostData) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </PageTransition>
      
      {/* 只有当总页数大于1时才显示分页组件 */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </PageContainer>
  );
} 