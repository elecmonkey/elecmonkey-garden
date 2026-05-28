import { useEffect, useRef } from 'react';
import { enhanceArticleContent } from './enhancer';
import type { MarkdownIsland } from '@/lib/api';

type StaticArticleContentProps = {
  postId: string;
  html: string;
  islands?: MarkdownIsland[];
};

export default function StaticArticleContent({ postId, html, islands = [] }: StaticArticleContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const articleHtml = prepareArticleHtml(html);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    return enhanceArticleContent(root, {
      postId,
      islands,
    });
  }, [postId, articleHtml, islands]);

  return (
    <div
      key={postId}
      ref={rootRef}
      className="markdown-content"
      data-article-content
      data-post-id={postId}
      dangerouslySetInnerHTML={{ __html: articleHtml }}
    />
  );
}

function prepareArticleHtml(html: string): string {
  return html.replace(/<a href="(https?:\/\/[^\"]+)"(?![^>]*\btarget=)/g, (_match, href: string) => (
    `<a href="${href}" target="_blank" rel="noopener noreferrer"`
  ));
}
