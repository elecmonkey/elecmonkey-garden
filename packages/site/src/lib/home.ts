import { generatedHomeContentByLocale } from '@/generated/home';
import type { PostData, TagCount } from './api';
import { type Locale, defaultLocale } from './i18n';
import { calculateTagSizes } from './tag-size';

export function getHomeRecentPosts(locale: Locale = defaultLocale): PostData[] {
  return [...generatedHomeContentByLocale[locale].recentPosts];
}

export function getHomeTags(locale: Locale = defaultLocale): TagCount[] {
  return calculateTagSizes(generatedHomeContentByLocale[locale].tags).map((tag) => ({ ...tag }));
}

export function getHomeStats(locale: Locale = defaultLocale): { totalPosts: number; latestUpdateDate: string | null } {
  return { ...generatedHomeContentByLocale[locale].stats };
}
