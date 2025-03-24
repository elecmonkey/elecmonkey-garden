import Link from 'next/link';
import { TagCount } from '@/lib/api';

interface TagListProps {
  tags: TagCount[];
}

export default function TagList({ tags }: TagListProps) {
  // 按文章数量降序排序标签
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  
  if (sortedTags.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-center italic">暂无标签</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedTags.map((tag) => (
        <Link
          key={tag.name}
          href={`/tags/${encodeURIComponent(tag.name)}`}
          className="group"
        >
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {tag.name}
            </span>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
              {tag.count} 篇文章
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
} 