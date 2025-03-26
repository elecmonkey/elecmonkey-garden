import { Metadata } from 'next';
import { getAllMonths, getPostsByMonth } from '@/lib/api';
import PageContainer from '@/components/PageContainer';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

type Props = {
  params: Promise<{ month: string }>;
};

// 生成可能的月份路径
export async function generateStaticParams() {
  const months = await getAllMonths();
  return months.map((month) => ({
    month: month.id,
  }));
}

// 为每个月份页生成元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  
  // 转换月份格式: YYYYMM -> YYYY年MM月
  const year = month.substring(0, 4);
  const monthNum = month.substring(4, 6);
  const displayName = `${year}年${monthNum}月`;
  
  return {
    title: `${displayName}归档 - Elecmonkey的小花园`,
    description: `查看 ${displayName} 发布的所有文章`,
  };
}

export default async function MonthArchivePage({ params }: Props) {
  const { month } = await params;
  
  // 转换月份格式: YYYYMM -> YYYY年MM月
  const year = month.substring(0, 4);
  const monthNum = month.substring(4, 6);
  const displayName = `${year}年${monthNum}月`;
  
  const posts = await getPostsByMonth(month);
  
  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            {displayName}
            <span className="ml-3 text-lg font-normal text-gray-500">({posts.length} 篇文章)</span>
          </h1>
          <div className="flex gap-2">
            <Link 
              href="/" 
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              主页
            </Link>
            <Link 
              href="/archive" 
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              所有归档
            </Link>
          </div>
        </div>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">该月份未找到文章</p>
          <Link href="/blog" className="text-blue-600 hover:underline mt-4 inline-block">
            查看所有文章
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </PageContainer>
  );
} 