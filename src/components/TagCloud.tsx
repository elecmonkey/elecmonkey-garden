import Link from 'next/link';
import { TagCount } from '@/lib/api';

interface TagCloudProps {
  tags: TagCount[];
  limit?: number; // 可选参数，限制显示的标签数量
}

export default function TagCloud({ tags, limit = 20 }: TagCloudProps) {
  if (tags.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-center italic">暂无标签</p>;
  }

  // 按文章数量降序排序并限制数量
  const sortedTags = [...tags]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  
  // 重新排序，使最大的标签在中间
  const reorderedTags = [...sortedTags];
  
  // 如果有足够的标签，我们将最大的放中间
  if (reorderedTags.length > 2) {
    // 取出最大的标签（第一个）
    const biggest = reorderedTags.shift();
    
    // 将大标签插入到中间位置
    if (biggest) {
      const middleIndex = Math.floor(reorderedTags.length / 2);
      reorderedTags.splice(middleIndex, 0, biggest);
    }
  }

  // 调整标签大小，确保最小标签不会太小
  const adjustedTags = reorderedTags.map(tag => {
    // 如果标签已经有自定义大小
    if (tag.size) {
      // 提取数字部分
      const sizeValue = parseFloat(tag.size.replace('em', ''));
      // 设置最小值为 1em，保持原有单位
      const adjustedSize = Math.max(1, sizeValue) + 'em';
      return { ...tag, size: adjustedSize };
    }
    return tag;
  });

  return (
    <div className="flex flex-wrap gap-1 justify-center items-center px-0 sm:px-10 md:px-20 lg:px-32 py-4">
      {adjustedTags.map((tag) => (
        <Link
          key={tag.name}
          href={`/tags/${encodeURIComponent(tag.name)}`}
          className="inline-block transition-colors m-0.5 my-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md transition-colors"
            style={{ fontSize: tag.size }}
          >
            {tag.name}
          </span>
        </Link>
      ))}
    </div>
  );
} 