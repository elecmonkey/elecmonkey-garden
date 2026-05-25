import { getAllPostsWithPagination } from '@/lib/api';
import BlogIndexContent from '@/components/blog/BlogIndexContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "所有文章 - Elecmonkey的小花园",
};

export default function BlogPage() {
  const currentPage = 1;
  
  // 获取分页的文章列表
  const { posts, totalPages } = getAllPostsWithPagination(currentPage);
  
  // 如果页码超出范围且总页数大于0，返回404
  if (currentPage > totalPages && totalPages > 0) {
    throw new Response('Not Found', { status: 404 });
  }

  return (
    <BlogIndexContent 
      currentPage={currentPage}
      posts={posts}
      totalPages={totalPages}
    />
  );
}
