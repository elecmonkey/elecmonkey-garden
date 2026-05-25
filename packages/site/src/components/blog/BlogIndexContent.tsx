import Link from 'next/link';
import PostCard from '@/components/PostCard';
import PathPagination from '@/components/PathPagination';
import { PostData } from '@/lib/api';
import { Suspense } from 'react';
import ScrollToContent from '@/components/ScrollToContent';
import PageContainer from '@/components/layout/PageContainer';

interface Props {
  currentPage: number;
  posts: PostData[];
  totalPages: number;
}

export default function BlogIndexContent({ currentPage, posts, totalPages }: Props) {
  const basePath = '/blog';

  return (
    <PageContainer>
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
        <PathPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
      )}
    </PageContainer>
  );
}
