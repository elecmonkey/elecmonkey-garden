import type { SiteMetadata } from '@/ssg/metadata-types';
import { getPostsByTagWithPagination } from '@/lib/api';
import type { Locale } from '@/lib/i18n';
import TagContent from '@/components/tags/TagContent';
import { decodeTagFromSlug } from '@/lib/tag-url';

type Props = {
  locale?: Locale;
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

export default function TagPage({ locale = 'zh', params }: Props) {
  const { tag } = params;
  const decodedTag = decodeTagFromSlug(tag);
  const currentPage = 1;
  
  const { posts, totalPosts, totalPages } = getPostsByTagWithPagination(locale, decodedTag, currentPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    throw new Response('Not Found', { status: 404 });
  }
  
  return (
    <TagContent 
      tag={decodedTag}
      tagSlug={tag}
      locale={locale}
      currentPage={currentPage}
      posts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
    />
  );
}
