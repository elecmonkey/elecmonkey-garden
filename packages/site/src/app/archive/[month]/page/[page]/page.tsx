import type { SiteMetadata } from '@/ssg/metadata-types';
import { getPostsByMonthWithPagination } from '@/lib/api';
import { dictionaries, type Locale } from '@/lib/i18n';
import MonthArchiveContent from '@/components/archive/MonthArchiveContent';

type Props = {
  locale?: Locale;
  params: { month: string; page: string };
};

export async function generateMetadata({ locale = 'zh', params }: Props): Promise<SiteMetadata> {
  const { month, page } = params;
  const year = month.substring(0, 4);
  const monthNum = month.substring(4, 6);
  const displayName = locale === 'en'
    ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${year}-${monthNum}-01T00:00:00.000Z`))
    : `${year}年${monthNum}月`;
  const siteName = dictionaries[locale].siteName;
   
  return {
    title: locale === 'en'
      ? `${displayName} Archive (Page ${page}) - ${siteName}`
      : `${displayName}归档 (第 ${page} 页) - ${siteName}`,
    description: locale === 'en'
      ? `Browse posts published in ${displayName} - page ${page}`
      : `查看 ${displayName} 发布的所有文章 - 第 ${page} 页`,
  };
}

export default function MonthArchivePaginationPage({ locale = 'zh', params }: Props) {
  const { month, page } = params;
  const currentPage = parseInt(page);
  
  if (isNaN(currentPage) || currentPage < 2) {
    throw new Response('Not Found', { status: 404 });
  }

  const { posts, totalPosts, totalPages } = getPostsByMonthWithPagination(locale, month, currentPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    throw new Response('Not Found', { status: 404 });
  }
  
  return (
    <MonthArchiveContent 
      month={month}
      locale={locale}
      currentPage={currentPage}
      posts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
    />
  );
}
