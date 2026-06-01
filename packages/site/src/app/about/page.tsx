import type { SiteMetadata } from '@/ssg/metadata-types';
import TechWall from './components/TechWall';
import type { Locale } from '@/lib/i18n';

import PageContainer from '@/components/layout/PageContainer';


export const metadata: SiteMetadata = {
  title: "关于我 - Elecmonkey的小花园",
};

export default function AboutPage({ locale = 'zh' }: { locale?: Locale }) {
  const isEnglish = locale === 'en';

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
        <TechWall />
      </div>
    </PageContainer>
  );
}
