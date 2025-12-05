import { Metadata } from 'next';
import TechWall from './components/TechWall';

import PageContainer from '@/components/layout/PageContainer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "关于我 - Elecmonkey的小花园",
};

export default function AboutPage() {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-8">关于我</h1>

      <div className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none">
        <section className="mb-12">
          <section className="text-lg text-foreground leading-relaxed">
            <p><span className="font-bold">Elecmonkey</span>，前端开发者。</p>
            <p>软件工程本科在读。</p>
          </section>
          <p className="text-lg text-foreground leading-relaxed mt-4">
            一个平平无奇的技术主页，试图记录我爬过的坑走过的路。
          </p>
        </section>
        <TechWall />
      </div>
    </PageContainer>
  );
} 