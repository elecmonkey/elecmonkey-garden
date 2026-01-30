import { Metadata } from 'next';
import { searchPostsWithPagination, SearchResultItem } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import SearchResultCard from '@/components/search/SearchResultCard';
import SearchBar from '@/components/search/SearchBar';
import Pagination from '@/components/Pagination';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ScrollToContent from '@/components/ScrollToContent';

// 搜索页无法预构建，始终会在请求时动态生成
export const dynamic = 'force-dynamic';

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
        <h1 className="text-3xl font-bold mb-8">搜索</h1>
        <div className="mb-8">
          <SearchBar placeholder="输入关键词搜索文章..." />
        </div>
        <div className="text-center py-10">
          <p className="text-muted-foreground">请输入关键词进行搜索</p>
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
      
      <h1 className="text-3xl font-bold mb-8">搜索</h1>
      
      <div className="mb-8">
        <SearchBar placeholder="搜索文章..." />
      </div>
      
      <div className="mb-6">
        <p className="text-foreground">
          找到 <span className="font-semibold">{totalPosts}</span> 篇与 
          &ldquo;<span className="font-semibold text-blue-600">{keyword}</span>&rdquo; 
          相关的文章
        </p>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">未找到相关文章</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((result: SearchResultItem) => (
            <SearchResultCard 
              key={result.post.id} 
              result={result} 
              keyword={keyword}
            />
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