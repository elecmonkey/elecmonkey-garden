import type { SiteMetadata } from '@/ssg/metadata-types';
import TechWall from './components/TechWall';
import { dictionaries, type Locale } from '@/lib/i18n';
import { useDocumentTitle, withSiteTitle } from '@/lib/use-document-title';

import PageContainer from '@/components/layout/PageContainer';

export function getMetadata(locale: Locale = 'zh'): SiteMetadata {
  return {
    title: `${locale === 'en' ? 'About' : '关于我'} - ${dictionaries[locale].siteName}`,
  };
}

export default function AboutPage({ locale = 'zh' }: { locale?: Locale }) {
  const isEnglish = locale === 'en';
  useDocumentTitle(withSiteTitle(locale, isEnglish ? 'About' : '关于我'));

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-8">{isEnglish ? 'About' : '关于我'}</h1>

      <div className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none">
        <section className="mb-12">
          <section className="text-lg text-foreground leading-relaxed">
            <p><span className="font-bold">Elecmonkey</span>{isEnglish ? ', frontend developer.' : '，前端开发者。'}</p>
            <p>{isEnglish ? 'Undergraduate student in software engineering.' : '软件工程本科在读。'}</p>
          </section>
          <p className="text-lg text-foreground leading-relaxed mt-4">
            {isEnglish ? 'A modest technical homepage for recording the pitfalls I have climbed through and the paths I have taken.' : '一个平平无奇的技术主页，试图记录我爬过的坑走过的路。'}
          </p>
        </section>
        <TechWall locale={locale} />
      </div>
    </PageContainer>
  );
}
