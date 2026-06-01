import type { SiteMetadata } from '@/ssg/metadata-types';
import PageContainer from '@/components/layout/PageContainer';
import ClientSearchPage from '@/components/search/ClientSearchPage';
import type { Locale } from '@/lib/i18n';

interface SearchPageProps {
  locale?: Locale;
  searchParams: {
    keyword?: string | string[];
    page?: string | string[];
    [key: string]: string | string[] | undefined;
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<SiteMetadata> {
  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : '';

  return {
    title: `搜索: ${keyword || '所有文章'} - Elecmonkey的小花园`,
    description: `搜索关于 "${keyword}" 的文章结果`,
  };
}

export default function SearchPage({ locale = 'zh' }: { locale?: Locale }) {
  return (
    <PageContainer>
      <ClientSearchPage locale={locale} />
    </PageContainer>
  );
}
