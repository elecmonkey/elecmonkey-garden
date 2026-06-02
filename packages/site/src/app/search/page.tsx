import type { SiteMetadata } from '@/ssg/metadata-types';
import PageContainer from '@/components/layout/PageContainer';
import ClientSearchPage from '@/components/search/ClientSearchPage';
import { dictionaries, type Locale } from '@/lib/i18n';

interface SearchPageProps {
  locale?: Locale;
  searchParams: {
    keyword?: string | string[];
    page?: string | string[];
    [key: string]: string | string[] | undefined;
  };
}

export async function generateMetadata({ locale = 'zh', searchParams }: SearchPageProps): Promise<SiteMetadata> {
  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : '';
  const siteName = dictionaries[locale].siteName;

  return {
    title: locale === 'en'
      ? `Search: ${keyword || 'All Posts'} - ${siteName}`
      : `搜索: ${keyword || '所有文章'} - ${siteName}`,
    description: locale === 'en'
      ? `Search results for "${keyword}"`
      : `搜索关于 "${keyword}" 的文章结果`,
  };
}

export default function SearchPage({ locale = 'zh' }: { locale?: Locale }) {
  return (
    <PageContainer>
      <ClientSearchPage locale={locale} />
    </PageContainer>
  );
}
