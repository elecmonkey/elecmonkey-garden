import Link from 'next/link';
import { TagCount } from '@/lib/api';

interface TagCloudProps {
  tags: TagCount[];
}

export default function TagCloud({ tags }: TagCloudProps) {
  if (tags.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-center italic">暂无标签</p>;
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={`/tags/${encodeURIComponent(tag.name)}`}
          className="inline-block transition-colors"
        >
          <span
            className="hover:text-blue-600 dark:hover:text-blue-400 font-medium text-gray-700 dark:text-gray-300"
            style={{ fontSize: tag.size }}
          >
            {tag.name}
            <span className="text-gray-500 text-sm ml-1">({tag.count})</span>
          </span>
        </Link>
      ))}
    </div>
  );
} 