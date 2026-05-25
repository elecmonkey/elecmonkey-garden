import { Metadata } from 'next';
import { getAllTags, getPostsByTagWithPagination } from '@/lib/api';
import TagContent from '@/components/tags/TagContent';
import { notFound } from 'next/navigation';
import { decodeTagFromSlug, encodeTagToSlug } from '@/lib/tag-url';

type Props = {
  params: Promise<{ tag: string }>;
};

// 预生成所有标签的静态路径（仅第一页）
export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: encodeTagToSlug(tag.name),
  }));
}

// 为每个标签页生成元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeTagFromSlug(tag);
  
  return {
    title: `#${decodedTag} - Elecmonkey的小花园`,
    description: `查看所有与 ${decodedTag} 相关的文章`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeTagFromSlug(tag);
  const currentPage = 1;
  
  const { posts, totalPosts, totalPages } = await getPostsByTagWithPagination(decodedTag, currentPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }
  
  return (
    <TagContent 
      tag={decodedTag}
      tagSlug={tag}
      currentPage={currentPage}
      posts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
    />
  );
}
