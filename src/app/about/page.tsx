import PageContainer from '@/components/PageContainer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "关于我 - Elecmonkey的小花园",
};

export default function AboutPage() {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-8">关于我</h1>
      
      <div className="prose dark:prose-invert lg:prose-lg max-w-none">
        <section className="mb-12">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <em>Elecmonkey</em>，软件工程本科在读。
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            一个平平无奇的技术主页，试图记录我爬过的坑走过的路。
          </p>
        </section>
        
      </div>
    </PageContainer>
  );
} 