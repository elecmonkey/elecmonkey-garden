import { Metadata } from 'next';
import { getAllTags, getPostsByTag } from '@/lib/api';
import PageContainer from '@/components/PageContainer';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

type Props = {
  params: Promise<{ tag: string }>;
};

// 生成可能的标签路径
export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: tag.name,
  }));
}

// 为每个标签页生成元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  return {
    title: `#${decodedTag} - Elecmonkey的小花园`,
    description: `查看所有与 ${decodedTag} 相关的文章`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = await getPostsByTag(decodedTag);
  
  return (
    <PageContainer>
      <div className="mb-8">
        <Link href="/tags" className="text-blue-600 hover:underline mb-2 inline-block">
          &larr; 所有标签
        </Link>
        <h1 className="text-3xl font-bold flex items-center">
          <span className="mr-2 text-gray-700 dark:text-gray-300">#</span>
          {decodedTag}
          <span className="ml-3 text-lg font-normal text-gray-500">({posts.length} 篇文章)</span>
        </h1>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">未找到带有此标签的文章</p>
          <Link href="/blog" className="text-blue-600 hover:underline mt-4 inline-block">
            查看所有文章
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </PageContainer>
  );
} 