export function enhanceExternalLinks(root: HTMLElement) {
  const links = root.querySelectorAll<HTMLAnchorElement>('a[href^="http://"], a[href^="https://"]');

  links.forEach((link) => {
    link.target = '_blank';
    const rel = new Set((link.rel || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.rel = Array.from(rel).join(' ');
  });
}
