'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/Pagination';
import ScrollToContent from '@/components/ScrollToContent';
import SearchBar from '@/components/search/SearchBar';
import SearchResultCard from '@/components/search/SearchResultCard';
import { useSearchParams } from '@/lib/router-compat';
import { dictionaries, type Locale, defaultLocale } from '@/lib/i18n';
import {
  getLoadedSearchIndexPosts,
  loadSearchIndexPosts,
  searchIndexPostsWithPagination,
  type SearchIndexPost,
  type SearchResult,
} from '@/lib/search';
import { useDocumentTitle, withSiteTitle } from '@/lib/use-document-title';

const pageSize = 10;

export default function ClientSearchPage({ locale = defaultLocale }: { locale?: Locale }) {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const [indexPosts, setIndexPosts] = useState<SearchIndexPost[]>(() => getLoadedSearchIndexPosts(locale) ?? []);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const dictionary = dictionaries[locale];
  useDocumentTitle(withSiteTitle(locale, locale === 'en' ? `Search: ${keyword || 'All Posts'}` : `搜索: ${keyword || '所有文章'}`));

  useEffect(() => {
    if (!keyword.trim()) {
      return;
    }

    let canceled = false;
    setLoading(true);
    setLoadError(false);

    const cachedIndexPosts = getLoadedSearchIndexPosts(locale);

    if (cachedIndexPosts) {
      setIndexPosts(cachedIndexPosts);
      setLoading(false);
      return () => {
        canceled = true;
      };
    }

    loadSearchIndexPosts(locale)
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
  }, [keyword, locale]);

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
        <h1 className="text-3xl font-bold mb-8">{dictionary.search.title}</h1>
        <div className="mb-8">
          <SearchBar placeholder={dictionary.search.emptyPlaceholder} />
        </div>
        <div className="text-center py-10">
          <p className="text-muted-foreground">{dictionary.search.enterKeyword}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToContent />
      </Suspense>

      <h1 className="text-3xl font-bold mb-8">{dictionary.search.title}</h1>

      <div className="mb-8">
        <SearchBar placeholder={dictionary.search.placeholder} />
      </div>

      {loadError ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">{dictionary.search.loadError}</p>
        </div>
      ) : loading ? null : (
        <>
          <div className="mb-6">
            <p className="text-foreground">
              {dictionary.search.resultPrefix} <span className="font-semibold">{totalPosts}</span> {dictionary.search.resultMiddle}
              {' '}
              &ldquo;<span className="font-semibold text-blue-600">{keyword}</span>&rdquo;
              {' '}
              {dictionary.search.resultSuffix}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{dictionary.search.noResults}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((result) => (
                <SearchResultCard
                  key={result.post.id}
                  locale={locale}
                  result={result}
                  keyword={keyword}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} locale={locale} />
          )}
        </>
      )}
    </>
  );
}
