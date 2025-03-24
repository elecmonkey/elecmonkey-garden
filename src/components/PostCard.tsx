import Link from 'next/link';

interface PostCardProps {
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
    <article className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
      <Link href={`/blog/${post.id}`}>
        <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">{post.title}</h3>
      </Link>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 align-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {new Date(post.date).toLocaleDateString('zh-CN', {
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
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">{post.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag: string) => (
          <span
            key={tag}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
} 