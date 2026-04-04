const SLASH_PLACEHOLDER = '_slash_';

export function encodeTagToSlug(tag: string): string {
  if (!tag.includes('/')) {
    return encodeURIComponent(tag);
  }

  return encodeURIComponent(tag.replaceAll('/', SLASH_PLACEHOLDER));
}

export function decodeTagFromSlug(slug: string): string {
  return decodeURIComponent(slug).replaceAll(SLASH_PLACEHOLDER, '/');
}

export function getTagPath(tag: string): string {
  return `/tags/${encodeTagToSlug(tag)}`;
}
