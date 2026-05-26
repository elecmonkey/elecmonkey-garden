import type { SiteMetadata } from '@/ssg/metadata-types';
import { getPostsByMonthWithPagination } from '@/lib/api';
import MonthArchiveContent from '@/components/archive/MonthArchiveContent';

type Props = {
  params: { month: string };
};

// 为每个月份页生成元数据
export async function generateMetadata({ params }: Props): Promise<SiteMetadata> {
  const { month } = params;
  
  // 转换月份格式: YYYYMM -> YYYY年MM月
  const year = month.substring(0, 4);
  const monthNum = month.substring(4, 6);
  const displayName = `${year}年${monthNum}月`;
  
  return {
    title: `${displayName}归档 - Elecmonkey的小花园`,
    description: `查看 ${displayName} 发布的所有文章`,
  };
}

export default function MonthArchivePage({ params }: Props) {
  const { month } = params;
  const currentPage = 1;
  
  // 获取分页的文章列表
  const { posts, totalPosts, totalPages } = getPostsByMonthWithPagination(month, currentPage);
  
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
