import { Metadata } from 'next';
import { getAllTags } from '@/lib/api';
import PageContainer from '@/components/PageContainer';
import TagList from '@/components/TagList';

export const metadata: Metadata = {
  title: '所有标签 - Elecmonkey的小花园',
  description: '浏览所有博客标签和主题',
};

export default async function TagsIndexPage() {
  const tags = await getAllTags();
  
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-2">所有标签</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">按文章数量排序</p>
      
      <TagList tags={tags} />
      
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
        <p>点击标签查看相关文章</p>
      </div>
    </PageContainer>
  );
} 