import Link from "next/link"
import { TagIcon } from 'lucide-react'

interface TagCount {
  name: string
  count: number
  size?: string
}

interface TagCloudProps {
  tags: TagCount[]
  limit?: number
}

export default function TagCloud({ tags, limit = 20 }: TagCloudProps) {
  if (tags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <TagIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 italic">暂无标签</p>
      </div>
    )
  }

  // 按计数排序（降序）并限制数量
  const sortedTags = [...tags].sort((a, b) => b.count - a.count).slice(0, limit)

  // 计算最小和最大计数以调整大小
  const maxCount = Math.max(...sortedTags.map((tag) => tag.count))
  const minCount = Math.min(...sortedTags.map((tag) => tag.count))

  // 根据计数计算标签大小
  const processedTags = sortedTags.map((tag) => {
    // 根据计数计算大小，范围在 0.9 到 1.6em 之间
    const sizeRange = 0.7 // 最大和最小尺寸之间的差异
    const minSize = 0.9 // 最小尺寸（em）

    // 如果只有一个标签或所有标签计数相同
    const normalizedSize = maxCount === minCount ? 0.5 : (tag.count - minCount) / (maxCount - minCount)

    const calculatedSize = minSize + normalizedSize * sizeRange

    return {
      ...tag,
      calculatedSize,
    }
  })

  // 使用确定性洗牌算法，以便在 SSG 中工作
  const shuffledTags = [...processedTags].sort((a, b) => {
    // 标签名称的简单哈希函数，创建确定性排序
    const hashA = a.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hashB = b.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return hashA - hashB
  })

  return (
    <div className="w-full py-6">
      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 px-2 md:px-8">
        {shuffledTags.map((tag) => (
          <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`} className="group relative">
            <div
              className="relative px-3 py-1.5 rounded-lg transition-all duration-300 
                        border border-gray-200 dark:border-gray-700 
                        bg-white/80 dark:bg-gray-800/80 
                        hover:bg-white dark:hover:bg-gray-800 
                        shadow-sm hover:shadow-md 
                        group-hover:border-primary-400 dark:group-hover:border-primary-500
                        group-hover:text-primary-600 dark:group-hover:text-primary-400 
                        text-gray-700 dark:text-gray-300 
                        hover:text-gray-900 dark:hover:text-gray-100
                        transform hover:scale-105
                        flex items-center"
              style={{
                fontSize: `${tag.calculatedSize}rem`,
              }}
            >
              <span className="relative z-10">{tag.name}</span>

              {/* 计数徽章 - 优化设计 */}
              <span
                className="absolute -top-1.5 -right-1.5 z-20 
                              min-w-[18px] h-[18px] px-1 
                              flex items-center justify-center 
                              rounded-lg text-[0.65rem] font-medium 
                              bg-gray-200 dark:bg-gray-700 
                              text-gray-700 dark:text-gray-300
                              border border-gray-300 dark:border-gray-600
                              transition-all duration-300 
                              group-hover:bg-blue-600 dark:group-hover:bg-blue-400
                              group-hover:text-white dark:group-hover:text-white
                              group-hover:border-blue-600 dark:group-hover:border-blue-400
                              shadow-sm"
              >
                {tag.count}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
