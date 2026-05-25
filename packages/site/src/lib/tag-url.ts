const TAG_PLACEHOLDERS = [
  ['/', '_slash_'],
  [' ', '_space_'],
] as const;

function replaceTagSpecialChars(value: string): string {
  return TAG_PLACEHOLDERS.reduce(
    (result, [char, placeholder]) => result.replaceAll(char, placeholder),
    value
  );
}

function restoreTagSpecialChars(value: string): string {
  return TAG_PLACEHOLDERS.reduce(
    (result, [char, placeholder]) => result.replaceAll(placeholder, char),
    value
  );
}

export function encodeTagToSlug(tag: string): string {
  const replacedTag = replaceTagSpecialChars(tag);

  if (replacedTag === tag) {
    return encodeURIComponent(tag);
  }

  return encodeURIComponent(replacedTag);
}

export function decodeTagFromSlug(slug: string): string {
  return restoreTagSpecialChars(decodeURIComponent(slug));
}

export function getTagPath(tag: string): string {
  return `/tags/${encodeTagToSlug(tag)}`;
}
