import { getAllPostsWithPagination } from '@/lib/api';
import BlogIndexContent from '@/components/blog/BlogIndexContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ page: string }>;
}

// 预生成所有分页的静态路径
export async function generateStaticParams() {
  const { totalPages } = await getAllPostsWithPagination(1);
  const params = [];
  
  // 从第2页开始生成
  for (let page = 2; page <= totalPages; page++) {
    params.push({ 
      page: page.toString(),
    });
  }
  
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  
  return {
    title: `所有文章 (第 ${page} 页) - Elecmonkey的小花园`,
    description: `查看所有文章 - 第 ${page} 页`,
  };
}

export default async function BlogPaginationPage({ params }: Props) {
  const { page } = await params;
  const currentPage = parseInt(page);
  
  if (isNaN(currentPage) || currentPage < 2) {
    notFound();
  }

  const { posts, totalPages } = await getAllPostsWithPagination(currentPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }
  
  return (
    <BlogIndexContent 
      currentPage={currentPage}
      posts={posts}
      totalPages={totalPages}
    />
  );
}
