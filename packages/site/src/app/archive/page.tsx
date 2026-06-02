import type { SiteMetadata } from '@/ssg/metadata-types';
import { getAllMonths } from '@/lib/api';
import { dictionaries, type Locale, archiveHref } from '@/lib/i18n';
import PageContainer from '@/components/layout/PageContainer';
import Link from '@/components/Link';
import { useDocumentTitle, withSiteTitle } from '@/lib/use-document-title';

export const metadata: SiteMetadata = {
  title: '文章归档 - Elecmonkey的小花园',
  description: '按月份浏览所有博客文章',
};

export default function ArchiveIndexPage({ locale = 'zh' }: { locale?: Locale }) {
  const months = getAllMonths(locale);
  const dictionary = dictionaries[locale];
  useDocumentTitle(withSiteTitle(locale, locale === 'en' ? 'Archive' : '文章归档'));

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-2">{dictionary.archive.title}</h1>
      <p className="text-muted-foreground mb-8">{dictionary.archive.sortedByTime}</p>

      {months.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">{dictionary.archive.noPosts}</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {months.map((month) => (
            <Link
              key={month.id}
              href={archiveHref(locale, month.id)}
              className="relative group"
            >
              {/* 底层卡片 */}
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-muted/40 group-hover:bg-muted/50 border border-border transition-colors duration-200"></div>

              {/* 上层卡片 */}
              <div className="relative flex items-center justify-between p-4 bg-card hover:bg-card/90 border border-border transition-all duration-200 group-hover:-translate-y-1">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{month.displayName}</span>
                </div>
                <span className="bg-muted/50 text-foreground text-xs px-2 py-1">
                  {month.count} {dictionary.archive.postUnit}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-muted-foreground">
        <p>{dictionary.archive.monthHint}</p>
      </div>
    </PageContainer>
  );
}
