import type { Metadata } from 'next';
import { getAllTags, getPostsByTagWithPagination } from '@/lib/api';
import TagContent from '@/components/tags/TagContent';
import { decodeTagFromSlug, encodeTagToSlug } from '@/lib/tag-url';

type Props = {
  params: { tag: string; page: string };
};

// 预生成所有分页的静态路径
export async function generateStaticParams() {
  const tags = getAllTags();
  const params = [];
  
  for (const tag of tags) {
    const { totalPages } = getPostsByTagWithPagination(tag.name, 1);
    for (let page = 2; page <= totalPages; page++) {
      params.push({ 
        tag: encodeTagToSlug(tag.name),
        page: page.toString(),
      });
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag, page } = params;
  const decodedTag = decodeTagFromSlug(tag);
  
  return {
    title: `#${decodedTag} (第 ${page} 页) - Elecmonkey的小花园`,
    description: `查看所有与 ${decodedTag} 相关的文章 - 第 ${page} 页`,
  };
}

export default function TagPaginationPage({ params }: Props) {
  const { tag, page } = params;
  const decodedTag = decodeTagFromSlug(tag);
  const currentPage = parseInt(page);
  
  if (isNaN(currentPage) || currentPage < 2) {
    throw new Response('Not Found', { status: 404 });
  }

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
