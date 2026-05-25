import type { Metadata } from 'next';
import { getAllMonths, getPostsByMonthWithPagination } from '@/lib/api';
import MonthArchiveContent from '@/components/archive/MonthArchiveContent';

type Props = {
  params: Promise<{ month: string }>;
};

// 预生成所有月份的静态路径（仅第一页）
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
  const currentPage = 1;
  
  // 获取分页的文章列表
  const { posts, totalPosts, totalPages } = await getPostsByMonthWithPagination(month, currentPage);
  
  // 如果页码超出范围且总页数大于0，返回404
  if (currentPage > totalPages && totalPages > 0) {
    throw new Response('Not Found', { status: 404 });
  }
  
  return (
    <MonthArchiveContent 
      month={month}
      currentPage={currentPage}
      posts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
    />
  );
}
