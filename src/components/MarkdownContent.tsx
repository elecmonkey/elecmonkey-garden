import ReactMarkdown from 'react-markdown';
import { CodeComponent } from './ClientMarkdownRenderer';

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
        
        // 添加图片样式
        img: ({ src, alt, ...props }) => (
          <img 
            src={src} 
            alt={alt || ''} 
            className="max-w-full my-4 rounded shadow-md"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
} 