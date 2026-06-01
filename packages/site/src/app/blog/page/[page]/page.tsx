import { getAllPostsWithPagination } from '@/lib/api';
import BlogIndexContent from '@/components/blog/BlogIndexContent';
import type { Locale } from '@/lib/i18n';
import type { SiteMetadata } from '@/ssg/metadata-types';

interface Props {
  locale?: Locale;
  params: { page: string };
}

export async function generateMetadata({ params }: Props): Promise<SiteMetadata> {
  const { page } = params;
  
  return {
    title: `所有文章 (第 ${page} 页) - Elecmonkey的小花园`,
    description: `查看所有文章 - 第 ${page} 页`,
  };
}

export default function BlogPaginationPage({ locale = 'zh', params }: Props) {
  const { page } = params;
  const currentPage = parseInt(page);
  
  if (isNaN(currentPage) || currentPage < 2) {
    throw new Response('Not Found', { status: 404 });
  }

  const { posts, totalPages } = getAllPostsWithPagination(locale, currentPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    throw new Response('Not Found', { status: 404 });
  }
  
  return (
    <BlogIndexContent 
      currentPage={currentPage}
      locale={locale}
      posts={posts}
      totalPages={totalPages}
    />
  );
}
