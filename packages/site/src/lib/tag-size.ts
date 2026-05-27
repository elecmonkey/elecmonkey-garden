export type TagSizeInput = {
  name: string;
  count: number;
  size?: string;
};

export function calculateTagSizes<T extends TagSizeInput>(tags: T[]): (T & { size: string })[] {
  if (tags.length === 0) {
    return [];
  }

  const maxCount = Math.max(...tags.map((tag) => tag.count));
  const minCount = Math.min(...tags.map((tag) => tag.count));
  const minSize = 0.8;
  const maxSize = 2;

  return tags.map((tag) => {
    if (maxCount === minCount) {
      return { ...tag, size: `${(minSize + maxSize) / 2}em` };
    }

    const size = minSize + ((tag.count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
    return { ...tag, size: `${size.toFixed(2)}em` };
  });
}
