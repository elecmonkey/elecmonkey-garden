import { getAllPosts } from '@/lib/api';
import PageContainer from '@/components/PageContainer';
import PostCard from '@/components/PostCard';
import ScrollToContent from '@/components/ScrollToContent';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "所有文章 - Elecmonkey的小花园",
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  // 文章已按日期降序排列

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
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
        >
          按月归档
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">暂无文章，请稍后再来！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </PageContainer>
  );
} 