import { getAllPostsWithPagination } from '@/lib/api';
import BlogIndexContent from '@/components/blog/BlogIndexContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: "所有文章 - Elecmonkey的小花园",
};

export default async function BlogPage() {
  const currentPage = 1;
  
  // 获取分页的文章列表
  const { posts, totalPages } = await getAllPostsWithPagination(currentPage);
  
  // 如果页码超出范围且总页数大于0，返回404
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
