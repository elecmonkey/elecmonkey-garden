import Link from 'next/link';
import { getAllPosts, getAllTags } from '@/lib/api';
import PostCard from '@/components/PostCard';
import TagCloud from '@/components/tag/TagCloud';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Elecmonkey的小花园 - 存在 为将心声响彻",
  description: "Elecmonkey的小花园 - 专注前端技术的技术博客，探索JavaScript、TypeScript、React、Vue、Next.js等前端生态，分享前端工程化、性能优化、架构设计等实践经验。",
  openGraph: {
    title: "Elecmonkey的小花园 - 前端技术博客",
    description: "专注于前端技术的技术博客，分享前端开发经验、工程化实践和最佳实践",
    type: 'website',
  },
};

export default async function Home() {
  // 获取所有文章并只显示最近的5篇
  const allPosts = await getAllPosts();
  const recentPosts = allPosts.slice(0, 5);
  
  // 获取所有标签
  const tags = await getAllTags();
  
  // 计算统计信息
  const totalPosts = allPosts.length;
  const latestUpdateDate = allPosts.length > 0 ? allPosts[0].date : null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 mb-10">
      {/* 个人介绍部分 - 全宽 */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4">
          <div className="relative">
            <div className="w-36 h-36 md:w-42 md:h-42 relative overflow-hidden rounded-full ring-2 ring-primary/20">
              <div className="w-full h-full flex items-center justify-center">
                <Image 
                  src="https://images.elecmonkey.com/pages/em.png" 
                  alt="EM" 
                  width={200} 
                  height={200}
                  className="w-[100%] h-[100%] object-cover"
                />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h1>
              <span className="text-4xl md:text-5xl font-bold">Elecmonkey</span>
              <span className="text-4xl md:text-5xl font-light">&apos;s Garden</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mt-3 mb-6" title="来自COP《光与影的对白》"> - 存在 为将心声响彻 - </p>
            
            {/* 导航链接 */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link 
                href="/blog" 
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                所有文章
              </Link>
              <Link 
                href="/about" 
                className="px-4 py-2 text-foreground bg-muted hover:bg-accent transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                关于我
              </Link>
              <a 
                href="https://github.com/elecmonkey" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 text-foreground bg-muted hover:bg-accent transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 主内容区 + 侧边栏布局 */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <main className="flex-1 min-w-0">
          <section>
            <div className="space-y-5">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* 如果没有文章，显示提示 */}
            {recentPosts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">暂无文章，请稍后再来！</p>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <Link 
                  href="/blog?scroll=true"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-base"
                >
                  查看所有文章
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              </div>
            )}
          </section>
        </main>

        {/* 右侧边栏 */}
        <aside className="lg:w-90 flex-shrink-0">
          <div className="sticky top-5 space-y-6">
            {/* 数据统计 */}
            <h3 className="text-xl font-semibold">小花园</h3>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center py-6 lg:pt-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-2xl font-bold text-foreground mb-2">{totalPosts}</div>
                <div className="text-sm text-muted-foreground">文章总数</div>
              </div>
              
              {latestUpdateDate && (
                <div className="flex flex-col items-center justify-center py-6 lg:pt-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {new Date(latestUpdateDate).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    }).replace(/\//g, '-')}
                  </div>
                  <div className="text-sm text-muted-foreground">最新更新</div>
                </div>
              )}
            </div>
            
            {/* 标签云 */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">标签云</h3>
                <Link 
                  href="/tags" 
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  所有标签
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <TagCloud tags={tags} limit={18} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
