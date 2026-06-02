import { getAllPostsWithPagination } from '@/lib/api';
import BlogIndexContent from '@/components/blog/BlogIndexContent';
import { dictionaries, type Locale } from '@/lib/i18n';
import type { SiteMetadata } from '@/ssg/metadata-types';

export function getMetadata(locale: Locale = 'zh'): SiteMetadata {
  return {
    title: `${locale === 'en' ? 'Posts' : '所有文章'} - ${dictionaries[locale].siteName}`,
  };
}

export default function BlogPage({ locale = 'zh' }: { locale?: Locale }) {
  const currentPage = 1;
  
  // 获取分页的文章列表
  const { posts, totalPages } = getAllPostsWithPagination(locale, currentPage);
  
  // 如果页码超出范围且总页数大于0，返回404
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
