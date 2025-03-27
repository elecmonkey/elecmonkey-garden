import { Metadata } from 'next';
import { searchPostsWithPagination } from '@/lib/api';
import PageContainer from '@/components/PageContainer';
import PostCard from '@/components/PostCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import PageTransition from '@/components/PageTransition';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ScrollToContent from '@/components/ScrollToContent';
import { PostData } from '@/lib/api';

interface SearchPageProps {
  searchParams: Promise<{ 
    keyword?: string | string[]; 
    page?: string | string[];
    [key: string]: string | string[] | undefined;
  }>;
}

// 动态生成元数据
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const keyword = typeof params.keyword === 'string' ? params.keyword : '';
  
  return {
    title: `搜索: ${keyword || '所有文章'} - Elecmonkey的小花园`,
    description: `搜索关于 "${keyword}" 的文章结果`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const keyword = typeof params.keyword === 'string' ? params.keyword : '';
  const currentPage = Number(params.page) || 1;
  
  // 如果没有关键词，显示空状态
  if (!keyword.trim()) {
    return (
      <PageContainer>
        <h1 className="text-3xl font-bold mb-8">搜索文章</h1>
        <div className="mb-8">
          <SearchBar className="max-w-2xl mx-auto" placeholder="输入关键词搜索文章..." />
        </div>
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">请输入关键词进行搜索</p>
        </div>
      </PageContainer>
    );
  }
  
  // 获取搜索结果
  const { posts, totalPosts, totalPages } = await searchPostsWithPagination(keyword, currentPage);
  
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
      
      <h1 className="text-3xl font-bold mb-4">搜索结果</h1>
      
      <div className="mb-8">
        <SearchBar className="max-w-2xl" />
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300">
          找到 <span className="font-semibold">{totalPosts}</span> 篇与 
          &ldquo;<span className="font-semibold text-blue-600 dark:text-blue-400">{keyword}</span>&rdquo; 
          相关的文章
        </p>
      </div>
      
      <PageTransition>
        {posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">未找到相关文章</p>
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