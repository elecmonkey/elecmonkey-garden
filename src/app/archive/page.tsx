import { Metadata } from 'next';
import { getAllMonths } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '文章归档 - Elecmonkey的小花园',
  description: '按月份浏览所有博客文章',
};

export default async function ArchiveIndexPage() {
  const months = await getAllMonths();
  
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-2">文章归档</h1>
      <p className="text-muted-foreground mb-8">按时间排序</p>
      
      {months.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">暂无文章</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {months.map((month) => (
            <Link
              key={month.id}
              href={`/archive/${month.id}`}
              className="flex items-center justify-between p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{month.displayName}</span>
              </div>
              <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                {month.count} 篇
              </span>
            </Link>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center text-muted-foreground">
        <p>点击月份查看相关文章</p>
      </div>
    </PageContainer>
  );
} 