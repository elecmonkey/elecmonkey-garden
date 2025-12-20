import { Metadata } from 'next';
import { getAllTags, getPostsByTagWithPagination } from '@/lib/api';
import TagContent from '@/components/tags/TagContent';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ tag: string; page: string }>;
};

// 预生成所有分页的静态路径
export async function generateStaticParams() {
  const tags = await getAllTags();
  const params = [];
  
  for (const tag of tags) {
    const { totalPages } = await getPostsByTagWithPagination(tag.name, 1);
    for (let page = 2; page <= totalPages; page++) {
      params.push({ 
        tag: tag.name,
        page: page.toString(),
      });
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag, page } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  return {
    title: `#${decodedTag} (第 ${page} 页) - Elecmonkey的小花园`,
    description: `查看所有与 ${decodedTag} 相关的文章 - 第 ${page} 页`,
  };
}

export default async function TagPaginationPage({ params }: Props) {
  const { tag, page } = await params;
  const decodedTag = decodeURIComponent(tag);
  const currentPage = parseInt(page);
  
  if (isNaN(currentPage) || currentPage < 2) {
    notFound();
  }

  const { posts, totalPosts, totalPages } = await getPostsByTagWithPagination(decodedTag, currentPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }
  
  return (
    <TagContent 
      tag={tag}
      currentPage={currentPage}
      posts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
    />
  );
}
