import Link from '@/components/Link';
import PostCard from '@/components/PostCard';
import PathPagination from '@/components/PathPagination';
import { PostData } from '@/lib/api';
import { dictionaries, type Locale, hrefFor } from '@/lib/i18n';
import { Suspense } from 'react';
import ScrollToContent from '@/components/ScrollToContent';
import PageContainer from '@/components/layout/PageContainer';
import { useDocumentTitle, withSiteTitle } from '@/lib/use-document-title';

interface Props {
  currentPage: number;
  locale: Locale;
  posts: PostData[];
  totalPages: number;
}

export default function BlogIndexContent({ currentPage, locale, posts, totalPages }: Props) {
  const basePath = hrefFor(locale, '/blog');
  const dictionary = dictionaries[locale];
  useDocumentTitle(withSiteTitle(
    locale,
    locale === 'en'
      ? currentPage > 1 ? `Posts (Page ${currentPage})` : 'Posts'
      : currentPage > 1 ? `所有文章 (第 ${currentPage} 页)` : '所有文章',
  ));

  return (
    <PageContainer>
      <Suspense fallback={null}>
        <ScrollToContent />
      </Suspense>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{dictionary.blog.title}</h1>
        <Link
          href={hrefFor(locale, '/archive')}
          prefetch
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          {dictionary.blog.monthlyArchive}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">{dictionary.common.noPosts}</p>
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
        <PathPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} locale={locale} />
      )}
    </PageContainer>
  );
}
