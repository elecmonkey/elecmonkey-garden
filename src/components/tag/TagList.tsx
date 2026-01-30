import Link from 'next/link';
import { TagCount } from '@/lib/api';

interface TagListProps {
  tags: TagCount[];
}

export default function TagList({ tags }: TagListProps) {
  // 按文章数量降序排序标签
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  
  if (sortedTags.length === 0) {
    return <p className="text-muted-foreground text-center italic">暂无标签</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {sortedTags.map((tag) => (
        <Link
          key={tag.name}
          href={`/tags/${encodeURIComponent(tag.name)}`}
          className="relative group"
        >
          {/* 底层卡片 */}
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-muted/40 group-hover:bg-muted/50 border border-border transition-colors duration-200"></div>
          
          {/* 上层卡片 */}
          <div className="relative flex items-center justify-between p-4 bg-card hover:bg-card/90 border border-border transition-all duration-200 group-hover:-translate-y-1">
            <span className="font-medium text-foreground group-hover:text-primary">
              {tag.name}
            </span>
            <span className="bg-muted/50 text-foreground px-2 py-1 text-xs">
              {tag.count} 篇文章
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
} 