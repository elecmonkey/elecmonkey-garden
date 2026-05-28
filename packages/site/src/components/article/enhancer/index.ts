import { enhanceCodeIslands } from './code';
import { enhanceExternalLinks } from './external-links';
import { enhanceFileDownloadIslands } from './file-download';
import { enhanceMermaidIslands } from './mermaid';
import type { ArticleEnhancerOptions, Cleanup } from './types';

export function enhanceArticleContent(root: HTMLElement, options: ArticleEnhancerOptions): Cleanup {
  const cleanups: Cleanup[] = [];

  enhanceExternalLinks(root);
  enhanceCodeIslands(root, cleanups);
  enhanceFileDownloadIslands(root);
  enhanceMermaidIslands(root, options.postId);

  root.dataset.enhanced = 'true';
  root.dataset.islandCount = String(options.islands.length);

  return () => {
    for (const cleanup of cleanups.splice(0)) {
      cleanup();
    }
  };
}

export type { ArticleEnhancerOptions, Cleanup } from './types';
