import Link from 'next/link';
import PostCard from '@/components/PostCard';
import PathPagination from '@/components/PathPagination';
import { PostData } from '@/lib/api';
import { Suspense } from 'react';
import ScrollToContent from '@/components/ScrollToContent';
import PageContainer from '@/components/layout/PageContainer';

interface Props {
  month: string;
  currentPage: number;
  posts: PostData[];
  totalPosts: number;
  totalPages: number;
}

export default function MonthArchiveContent({ month, currentPage, posts, totalPosts, totalPages }: Props) {
  // 转换月份格式: YYYYMM -> YYYY年MM月
  const year = month.substring(0, 4);
  const monthNum = month.substring(4, 6);
  const displayName = `${year}年${monthNum}月`;
  const basePath = `/archive/${month}`;

  return (
    <PageContainer>
      {/* 添加滚动处理组件，用 Suspense 包裹 */}
      <Suspense fallback={null}>
        <ScrollToContent />
      </Suspense>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold flex flex-wrap items-center whitespace-nowrap">
            <div className="flex items-center whitespace-nowrap">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              {displayName}
            </div>
            <span className="ml-3 text-lg font-normal text-gray-500 whitespace-nowrap">({totalPosts} 篇文章)</span>
          </h1>
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/" 
              className="px-3 py-1.5 border border-border rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              主页
            </Link>
            <Link 
              href="/archive" 
              className="px-3 py-1.5 border border-border rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              所有归档
            </Link>
          </div>
        </div>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">该月份未找到文章</p>
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
      
      {/* 只有当总页数大于1时才显示分页组件 */}
      {totalPages > 1 && (
        <PathPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
      )}
    </PageContainer>
  );
}
