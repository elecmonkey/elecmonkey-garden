'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/Pagination';
import ScrollToContent from '@/components/ScrollToContent';
import SearchBar from '@/components/search/SearchBar';
import SearchResultCard from '@/components/search/SearchResultCard';
import { useSearchParams } from '@/lib/router-compat';
import {
  searchIndexPostsWithPagination,
  type SearchIndexPost,
  type SearchResult,
} from '@/lib/search';

const pageSize = 10;

export default function ClientSearchPage() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const [indexPosts, setIndexPosts] = useState<SearchIndexPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!keyword.trim()) {
      return;
    }

    let canceled = false;
    setLoading(true);
    setLoadError(false);

    fetch('/static/search/index.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load search index: ${response.status}`);
        }
        return response.json() as Promise<SearchIndexPost[]>;
      })
      .then((posts) => {
        if (!canceled) {
          setIndexPosts(posts);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!canceled) {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!canceled) {
          setLoading(false);
        }
      });

    return () => {
      canceled = true;
    };
  }, [keyword]);

  const { posts, totalPosts, totalPages } = useMemo(() => {
    if (!keyword.trim()) {
      return {
        posts: [] as SearchResult[],
        totalPosts: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize,
      };
    }

    return searchIndexPostsWithPagination(keyword, indexPosts, currentPage, pageSize);
  }, [currentPage, indexPosts, keyword]);

  if (!keyword.trim()) {
    return (
      <>
        <h1 className="text-3xl font-bold mb-8">搜索</h1>
        <div className="mb-8">
          <SearchBar placeholder="输入关键词搜索文章..." />
        </div>
        <div className="text-center py-10">
          <p className="text-muted-foreground">请输入关键词进行搜索</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToContent />
      </Suspense>

      <h1 className="text-3xl font-bold mb-8">搜索</h1>

      <div className="mb-8">
        <SearchBar placeholder="搜索文章..." />
      </div>

      {loadError ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">搜索索引加载失败，请稍后重试</p>
        </div>
      ) : loading ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">正在加载搜索索引...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-foreground">
              找到 <span className="font-semibold">{totalPosts}</span> 篇与
              {' '}
              &ldquo;<span className="font-semibold text-blue-600">{keyword}</span>&rdquo;
              {' '}
              相关的文章
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">未找到相关文章</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((result) => (
                <SearchResultCard
                  key={result.post.id}
                  result={result}
                  keyword={keyword}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          )}
        </>
      )}
    </>
  );
}
