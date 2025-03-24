import ReactMarkdown from 'react-markdown';
import { CodeComponent } from './ClientMarkdownRenderer';
import Image from 'next/image';

// 服务器端组件包装器
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        // 添加各级标题的样式
        h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-bold mt-5 mb-2">{children}</h3>,
        h4: ({ children }) => <h4 className="text-lg font-bold mt-4 mb-2">{children}</h4>,
        h5: ({ children }) => <h5 className="text-base font-bold mt-3 mb-1">{children}</h5>,
        h6: ({ children }) => <h6 className="text-sm font-bold mt-3 mb-1">{children}</h6>,
        
        // 添加列表样式
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 mt-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 mt-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        
        // 代码块渲染 - 使用客户端组件
        code: CodeComponent,
        
        // 添加图片样式 - 使用 Next.js Image 组件优化图片
        img: ({ src, alt, width, height, ...props }) => {
          // 检查 src 是否存在
          if (!src) return null;
          
          // 设置默认宽高
          const imgWidth = typeof width === 'number' ? width : 800;
          const imgHeight = typeof height === 'number' ? height : 600;
          
          // 如果是外部 URL，使用 Image 组件并设置 domains 或 remotePatterns
          if (src.startsWith('http')) {
            return (
              <div className="my-4 overflow-hidden rounded shadow-md">
                <Image 
                  src={src} 
                  alt={alt || ''} 
                  width={imgWidth}
                  height={imgHeight}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="max-w-full"
                  style={{ width: '100%', height: 'auto' }}
                  {...props}
                />
              </div>
            );
          }
          
          // 对于本地图片，使用 Image 组件
          return (
            <div className="my-4 overflow-hidden rounded shadow-md">
              <Image 
                src={src} 
                alt={alt || ''} 
                width={imgWidth}
                height={imgHeight}
                sizes="(max-width: 768px) 100vw, 800px"
                className="max-w-full"
                style={{ width: '100%', height: 'auto' }}
                {...props}
              />
            </div>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
} 