import Link from 'next/link';

export interface PostCardProps {
  post: {
    id: string;
    title: string;
    date: string;
    description: string;
    tags: string[];
    author?: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="relative group">
      {/* 底层卡片 - 灰色背景，向右下偏移 */}
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-muted/40 group-hover:bg-muted/50 border border-border transition-colors duration-200"></div>
      
      {/* 上层卡片 - 白色/主题背景 */}
      <div className="relative p-4 bg-card hover:bg-card/90 border border-border transition-all duration-200 group-hover:-translate-y-1">
      <Link href={`/blog/${post.id}`}>
        <h3 className="text-xl font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors">{post.title}</h3>
      </Link>
      
      <p className="text-muted-foreground text-sm mb-3 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(post.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        {post.author && (
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {post.author}
          </span>
        )}
      </p>
      
      <p className="text-card-foreground/80 mb-4 line-clamp-2">{post.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag: string) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary px-2.5 py-1 rounded text-xs transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tag}
          </Link>
        ))}
      </div>
      </div>
    </article>
  );
} 