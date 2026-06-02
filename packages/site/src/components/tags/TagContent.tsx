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
  tag: string;
  tagSlug: string;
  locale: Locale;
  currentPage: number;
  posts: PostData[];
  totalPosts: number;
  totalPages: number;
}

export default function TagContent({ tag, tagSlug, locale, currentPage, posts, totalPosts, totalPages }: Props) {
  const basePath = hrefFor(locale, `/tags/${tagSlug}`);
  const dictionary = dictionaries[locale];
  useDocumentTitle(withSiteTitle(locale, currentPage > 1
    ? locale === 'en' ? `#${tag} (Page ${currentPage})` : `#${tag} (第 ${currentPage} 页)`
    : `#${tag}`));

  return (
    <PageContainer>
      <Suspense fallback={null}>
        <ScrollToContent />
      </Suspense>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold flex flex-wrap items-center whitespace-nowrap">
            <div className="flex items-center whitespace-nowrap">
              <span className="mr-2 text-muted-foreground">#</span>
              {tag}
            </div>
            <span className="ml-3 text-lg font-normal text-gray-500 whitespace-nowrap">({dictionary.common.postCount(totalPosts)})</span>
          </h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href={hrefFor(locale, '/')}
              className="px-3 py-1.5 border border-border rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {dictionary.common.home}
            </Link>
            <Link
              href={hrefFor(locale, '/tags')}
              className="px-3 py-1.5 border border-border rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {dictionary.home.allTags}
            </Link>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">{dictionary.tags.noPosts}</p>
          <Link href={hrefFor(locale, '/blog')} className="text-blue-600 hover:underline mt-4 inline-block">
            {dictionary.common.viewAllPosts}
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
        <PathPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} locale={locale} />
      )}
    </PageContainer>
  );
}
