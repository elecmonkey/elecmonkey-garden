import { getAllPosts } from '@/lib/api';
import PageContainer from '@/components/PageContainer';
import PostCard from '@/components/PostCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "所有文章 - Elecmonkey的小花园",
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  // 文章已按日期降序排列

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-8">博客文章</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">暂无文章，请稍后再来！</p>
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