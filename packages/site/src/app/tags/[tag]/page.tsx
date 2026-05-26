import type { SiteMetadata } from '@/ssg/metadata-types';
import { getPostsByTagWithPagination } from '@/lib/api';
import TagContent from '@/components/tags/TagContent';
import { decodeTagFromSlug } from '@/lib/tag-url';

type Props = {
  params: { tag: string };
};

// 为每个标签页生成元数据
export async function generateMetadata({ params }: Props): Promise<SiteMetadata> {
  const { tag } = params;
  const decodedTag = decodeTagFromSlug(tag);
  
  return {
    title: `#${decodedTag} - Elecmonkey的小花园`,
    description: `查看所有与 ${decodedTag} 相关的文章`,
  };
}

export default function TagPage({ params }: Props) {
  const { tag } = params;
  const decodedTag = decodeTagFromSlug(tag);
  const currentPage = 1;
  
  const { posts, totalPosts, totalPages } = getPostsByTagWithPagination(decodedTag, currentPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    throw new Response('Not Found', { status: 404 });
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
