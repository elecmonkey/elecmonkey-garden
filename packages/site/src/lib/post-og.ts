import type { PostData } from './api';

export function getPostOgImagePath(
  post: Pick<PostData, 'id' | 'locale' | 'og'>,
): string | undefined {
  const filename = typeof post.og === 'string' ? post.og.trim() : '';
  if (!filename) return undefined;
  if (!/^[a-z0-9][a-z0-9._-]*\.og\.jpg$/.test(filename)) {
    throw new Error(
      `Invalid og for ${post.locale}/${post.id}: use a local filename such as article-slug.og.jpg.`,
    );
  }
  return `/og/${post.locale}/${filename}`;
}
