import type { SiteMetadata } from '@/ssg/metadata-types';
import { getAllTags } from '@/lib/api';
import { dictionaries, type Locale } from '@/lib/i18n';
import PageContainer from '@/components/layout/PageContainer';
import TagList from '@/components/tag/TagList';

export const metadata: SiteMetadata = {
  title: '所有标签 - Elecmonkey的小花园',
  description: '浏览所有博客标签和主题',
};

export default function TagsIndexPage({ locale = 'zh' }: { locale?: Locale }) {
  const tags = getAllTags(locale);
  const dictionary = dictionaries[locale];

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
