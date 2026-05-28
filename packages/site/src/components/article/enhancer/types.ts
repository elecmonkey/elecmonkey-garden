import type { MarkdownIsland } from '@/lib/api';

export type ArticleEnhancerOptions = {
  postId: string;
  islands: MarkdownIsland[];
};

export type Cleanup = () => void;
