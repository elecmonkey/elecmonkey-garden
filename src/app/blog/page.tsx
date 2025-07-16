import { getAllPostsWithPagination } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PostCard from '@/components/PostCard';
import ScrollToContent from '@/components/ScrollToContent';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: "所有文章 - Elecmonkey的小花园",
};

// 预生成所有分页的静态页面
export async function generateStaticParams() {
  const { totalPages } = await getAllPostsWithPagination(1);
  
  // 为所有可能的页码生成参数
  const params = [];
  
  // 生成所有分页参数
  for (let page = 1; page <= totalPages; page++) {
    params.push({ searchParams: { page: page.toString() } });
  }
  
  return params;
}

interface BlogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // 获取当前页码，默认为第1页
  const searchParamsWait = await searchParams;
  const currentPage = Number(searchParamsWait.page) || 1;
  
  // 获取分页的文章列表
  const { posts, totalPages } = await getAllPostsWithPagination(currentPage);
  
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
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">博客文章</h1>
        <Link 
          href="/archive" 
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          按月归档
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">暂无文章，请稍后再来！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      
      {/* 只有当总页数大于1时才显示分页组件 */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </PageContainer>
  );
} 