import { dictionaries, type Locale } from '@/lib/i18n';
import { useDocumentTitle, withSiteTitle } from '@/lib/use-document-title';
import type { SiteMetadata } from '@/ssg/metadata-types';
import { ExternalLink } from 'lucide-react';
import TechWall from './components/TechWall';

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
        <section className="not-prose mb-12 relative">
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-muted/40 border border-border"></div>
          <div className="relative border border-border bg-card p-5 sm:p-6">
            <h2 className="mb-4 text-xl font-semibold tracking-normal text-foreground">
              {isEnglish ? 'Friends' : '友情链接'}
            </h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://blog.sww.moe/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-2 border border-border bg-background px-3 py-2 text-base font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60"
              >
                <span className="truncate">{isEnglish ? 'swwind\'s blog' : 'swwind 的博客'}</span>
                {isEnglish ? (
                  <span className="shrink-0 bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    Chinese
                  </span>
                ) : null}
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </a>
              <a
                href="https://saten.website/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-2 border border-border bg-background px-3 py-2 text-base font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60"
              >
                <span className="truncate">{isEnglish ? 'Saten\'s Base' : 'Saten同学的小基地'}</span>
                {isEnglish ? (
                  <span className="shrink-0 bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    Chinese
                  </span>
                ) : null}
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
        <TechWall locale={locale} />
      </div>
    </PageContainer>
  );
}
