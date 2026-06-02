import type { SiteMetadata } from '@/ssg/metadata-types';
import { getAllTags } from '@/lib/api';
import { dictionaries, type Locale } from '@/lib/i18n';
import PageContainer from '@/components/layout/PageContainer';
import TagList from '@/components/tag/TagList';
import { useDocumentTitle, withSiteTitle } from '@/lib/use-document-title';

export function getMetadata(locale: Locale = 'zh'): SiteMetadata {
  return {
    title: `${locale === 'en' ? 'Tags' : '所有标签'} - ${dictionaries[locale].siteName}`,
    description: locale === 'en' ? 'Browse all tags and topics' : '浏览所有博客标签和主题',
  };
}

export default function TagsIndexPage({ locale = 'zh' }: { locale?: Locale }) {
  const tags = getAllTags(locale);
  const dictionary = dictionaries[locale];
  useDocumentTitle(withSiteTitle(locale, locale === 'en' ? 'Tags' : '所有标签'));

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-2">{dictionary.tags.title}</h1>
      <p className="text-muted-foreground mb-8">{dictionary.tags.sortedByCount}</p>

      <TagList locale={locale} tags={tags} />

      <div className="mt-8 text-center text-muted-foreground">
        <p>{dictionary.tags.hint}</p>
      </div>
    </PageContainer>
  );
}
