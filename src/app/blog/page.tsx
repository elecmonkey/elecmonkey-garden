import Link from 'next/link';
import { getAllPosts } from '@/lib/api';
import PageContainer from '@/components/PageContainer';
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
            <article key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
              <Link href={`/blog/${post.id}`}>
                <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600 transition-colors">{post.title}</h2>
              </Link>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                {new Date(post.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{post.description}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
} 