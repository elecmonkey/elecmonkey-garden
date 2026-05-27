import { generatedHomeRecentPosts, generatedHomeStats, generatedHomeTags } from '@/generated/home';
import type { PostData, TagCount } from './api';
import { calculateTagSizes } from './tag-size';

export function getHomeRecentPosts(): PostData[] {
  return [...generatedHomeRecentPosts];
}

export function getHomeTags(): TagCount[] {
  return calculateTagSizes(generatedHomeTags).map((tag) => ({ ...tag }));
}

export function getHomeStats(): { totalPosts: number; latestUpdateDate: string | null } {
  return { ...generatedHomeStats };
}
