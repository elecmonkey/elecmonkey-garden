import { Metadata } from 'next';
import { getAllMonths, getPostsByMonthWithPagination } from '@/lib/api';
import MonthArchiveContent from '@/components/archive/MonthArchiveContent';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ month: string; page: string }>;
};

// 预生成所有分页的静态路径
export async function generateStaticParams() {
  const months = await getAllMonths();
  const params = [];
  
  for (const month of months) {
    const { totalPages } = await getPostsByMonthWithPagination(month.id, 1);
    // 从第2页开始生成
    for (let page = 2; page <= totalPages; page++) {
      params.push({ 
        month: month.id,
        page: page.toString(),
      });
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month, page } = await params;
  const year = month.substring(0, 4);
  const monthNum = month.substring(4, 6);
  const displayName = `${year}年${monthNum}月`;
  
  return {
    title: `${displayName}归档 (第 ${page} 页) - Elecmonkey的小花园`,
    description: `查看 ${displayName} 发布的所有文章 - 第 ${page} 页`,
  };
}

export default async function MonthArchivePaginationPage({ params }: Props) {
  const { month, page } = await params;
  const currentPage = parseInt(page);
  
  if (isNaN(currentPage) || currentPage < 2) {
    notFound();
  }

  const { posts, totalPosts, totalPages } = await getPostsByMonthWithPagination(month, currentPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    notFound();
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
