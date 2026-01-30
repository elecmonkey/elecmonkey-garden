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
        <TagIcon className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground italic">暂无标签</p>
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
    <div className="w-full">
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {shuffledTags.map((tag, index) => (
          <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`} className="group">
            <div
              className={`tag-color-${index % 8} px-2.5 py-1.5 transition-all duration-200`}
              style={{
                fontSize: `${tag.calculatedSize}rem`,
              }}
            >
              <span>{tag.name}</span>
              <span className="text-[0.7em] ml-1.5 opacity-70">
                {tag.count}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
