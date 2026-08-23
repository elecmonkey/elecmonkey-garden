import { useEffect, useState } from 'react';
import Link from '@/components/Link';
import { getTagPath } from '@/lib/tag-url';
import { getLoadedPostById, getPostById, loadPostById, type PostData } from '@/lib/api';
import { prefetchAdjacentArticles } from '@/lib/client-prefetch';
import { dictionaries, type Locale, postHref } from '@/lib/i18n';
import StaticArticleContent from '@/components/article/StaticArticleContent';
import ClientTableOfContents from '@/components/article/contents/TableOfContents';
import type { SiteMetadata } from '@/ssg/metadata-types';
import { useDocumentTitle, withSiteTitle } from '@/lib/use-document-title';

type Props = {
  locale?: Locale;
  params: { slug: string };
};

// 动态生成元数据
export async function generateMetadata({ locale = 'zh', params }: Props): Promise<SiteMetadata> {
  const { slug } = params;
  const siteName = dictionaries[locale].siteName;
  try {
    const post = getPostById(locale, slug);

    return {
      title: `${post.title} - ${siteName}`,
      description: post.description,
      // 禁止搜索引擎索引隐藏文章
      robots: post.isHidden ? 'noindex, nofollow' : undefined,
    };
  } catch {
    return {
      title: `${locale === 'en' ? 'Page Not Found' : '页面未找到'} - ${siteName}`,
    };
  }
}

// 异步组件
export default function BlogPost({ locale = 'zh', params }: Props) {
  const { slug } = params;
  const [post, setPost] = useState<(PostData & { prevPost?: { id: string; title: string }; nextPost?: { id: string; title: string } })>(() => {
    try {
      return getLoadedPostById(locale, slug) ?? getPostById(locale, slug);
    } catch (error) {
      console.error('博客文章获取失败:', error);
      throw new Response('Not Found', { status: 404 });
    }
  });
  const [loadError, setLoadError] = useState<Error | null>(null);
  useDocumentTitle(withSiteTitle(locale, post.title));

  useEffect(() => {
    let canceled = false;
    const isCompiledPost = (post: PostData) => (
      Boolean(post.html) && Array.isArray(post.toc) && Array.isArray(post.islands)
    );

    try {
      const cachedPost = getLoadedPostById(locale, slug) ?? getPostById(locale, slug);

      if (isCompiledPost(cachedPost)) {
        setPost((current) => (
          isCompiledPost(current) && current.locale === cachedPost.locale && current.id === cachedPost.id
            ? current
            : cachedPost
        ));
        setLoadError(null);
        return () => {
          canceled = true;
        };
      }

      setPost(cachedPost);
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)));
      return () => {
        canceled = true;
      };
    }

    loadPostById(locale, slug)
      .then((loadedPost) => {
        if (!canceled) {
          setPost(loadedPost);
          setLoadError(null);
        }
      })
      .catch((error) => {
        console.error('博客文章加载失败:', error);
        if (!canceled) {
          setLoadError(error instanceof Error ? error : new Error(String(error)));
        }
      });

    return () => {
      canceled = true;
    };
  }, [locale, slug]);

  useEffect(() => {
    if (post.id !== slug || !post.html) return;

    prefetchAdjacentArticles(locale, [post.nextPost?.id, post.prevPost?.id]);
  }, [locale, post.html, post.id, post.nextPost?.id, post.prevPost?.id, slug]);

  if (loadError) {
    throw new Response('Not Found', { status: 404 });
  }

  const articleNode = post.html
    ? <StaticArticleContent postId={post.id} html={post.html} islands={post.islands} />
    : null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 mb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 - 文章 */}
        <main className="flex-1 min-w-0">
          <article className="prose prose-slate dark:prose-invert lg:prose-xl max-w-none">
            <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {post.isHidden && (
                <span className="inline-block bg-gray-500 text-white text-sm py-1 px-2 rounded mr-2 align-middle">
                  隐藏
                </span>
              )}
              {post.title}
            </h1>
            <p className="text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 align-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(post.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {post.author && (
                <span>
                  <span className="mx-2"></span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 align-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {post.author}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={getTagPath(tag, locale)}
                  className="bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-1 rounded-md text-xs transition-colors no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </header>

          {articleNode}

          {/* 底部导航 */}
          {!post.isHidden && (
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex justify-between items-center">
              {/* 下一篇文章（更新的文章） */}
              <div className="w-1/2 pr-4 text-left">
                {post.nextPost ? (
                  <Link
                    href={postHref(locale, post.nextPost.id)}
                    prefetch
                    className="flex items-center text-muted-foreground hover:text-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="line-clamp-1 text-left min-w-0 mr-auto">
                      {post.nextPost.title}
                    </span>
                  </Link>
                ) : (
                  /* 占位，保持布局 */
                  <div></div>
                )}
              </div>

              {/* 上一篇文章（更旧的文章） */}
              <div className="w-1/2 pl-4">
                {post.prevPost ? (
                  <Link
                    href={postHref(locale, post.prevPost.id)}
                    prefetch
                    className="flex items-center text-muted-foreground hover:text-blue-600 transition-colors"
                  >
                    <span className="line-clamp-1 text-left min-w-0 ml-auto">
                      {post.prevPost.title}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  /* 占位，保持布局 */
                  <div></div>
                )}
              </div>
            </div>
          </div>
          )}
          </article>
        </main>

        {/* 右侧边栏 - 目录 */}
        <aside className="hidden lg:block lg:w-90 shrink-0">
          <div className="sticky top-22">
            <ClientTableOfContents no_toc={post.no_toc === true} desktop={true} headings={post.toc} locale={locale} />
          </div>
        </aside>
      </div>

      {/* 移动端浮动按钮和侧栏 */}
      <ClientTableOfContents no_toc={post.no_toc === true} desktop={false} headings={post.toc} locale={locale} />
    </div>
  );
}
