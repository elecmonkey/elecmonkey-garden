import type { SiteMetadata } from '@/ssg/metadata-types';
import { getPostsByTagWithPagination } from '@/lib/api';
import type { Locale } from '@/lib/i18n';
import TagContent from '@/components/tags/TagContent';
import { decodeTagFromSlug } from '@/lib/tag-url';

type Props = {
  locale?: Locale;
  params: { tag: string; page: string };
};

export async function generateMetadata({ params }: Props): Promise<SiteMetadata> {
  const { tag, page } = params;
  const decodedTag = decodeTagFromSlug(tag);
  
  return {
    title: `#${decodedTag} (第 ${page} 页) - Elecmonkey的小花园`,
    description: `查看所有与 ${decodedTag} 相关的文章 - 第 ${page} 页`,
  };
}

export default function TagPaginationPage({ locale = 'zh', params }: Props) {
  const { tag, page } = params;
  const decodedTag = decodeTagFromSlug(tag);
  const currentPage = parseInt(page);
  
  if (isNaN(currentPage) || currentPage < 2) {
    throw new Response('Not Found', { status: 404 });
  }

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
