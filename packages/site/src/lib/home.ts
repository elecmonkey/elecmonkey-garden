import { generatedHomeContentByLocale } from '@/generated/home';
import { getAllPosts, isPinnedPost, pinPostsFirst } from './api';
import type { PostData, TagCount } from './api';
import { type Locale, defaultLocale } from './i18n';
import { calculateTagSizes } from './tag-size';

export function getHomeRecentPosts(locale: Locale = defaultLocale): PostData[] {
  const { recentPosts } = generatedHomeContentByLocale[locale];
  const recentIds = new Set(recentPosts.map((post) => post.id));
  // 最近文章之外的置顶文章也要出现在首页，并占用一个展示名额
  const olderPinned = getAllPosts(locale).filter(
    (post) => isPinnedPost(post) && !recentIds.has(post.id),
  );

  return pinPostsFirst([...recentPosts, ...olderPinned]).slice(
    0,
    recentPosts.length,
  );
}

export function getHomeTags(locale: Locale = defaultLocale): TagCount[] {
  return calculateTagSizes(generatedHomeContentByLocale[locale].tags).map(
    (tag) => ({ ...tag }),
  );
}

export function getHomeStats(locale: Locale = defaultLocale): {
  totalPosts: number;
  latestUpdateDate: string | null;
} {
  return { ...generatedHomeContentByLocale[locale].stats };
}
