import ReactMarkdown from 'react-markdown';
import { CodeComponent } from './ClientMarkdownRenderer';
import Image from 'next/image';
import React from 'react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// 服务器端组件包装器
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-content prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 添加各级标题的样式
          h1: ({ children }) => {
            const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
            return <h1 id={id} className="text-3xl font-bold my-4">{children}</h1>;
          },
          h2: ({ children }) => {
            const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
            return <h2 id={id} className="text-2xl font-bold my-4">{children}</h2>;
          },
          h3: ({ children }) => {
            const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
            return <h3 id={id} className="text-xl font-bold my-4">{children}</h3>;
          },
          h4: ({ children }) => {
            const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
            return <h4 id={id} className="text-lg font-bold my-4">{children}</h4>;
          },
          h5: ({ children }) => {
            const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
            return <h5 id={id} className="text-base font-bold my-4">{children}</h5>;
          },
          h6: ({ children }) => {
            const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
            return <h6 id={id} className="text-sm font-bold my-4">{children}</h6>;
          },
          
          // 添加段落样式 - 增加段落间距、调整文字大小和添加首行缩进
          p: ({ children, node }) => {
            // 检查段落文本是否包含特殊标记 [indent]
            let paragraphText = '';
            let hasIndentTag = false;
            
            // 尝试获取段落的原始文本内容
            if (node && node.children && node.children.length > 0) {
              // 遍历所有子节点来获取完整文本
              for (const child of node.children) {
                if (child.type === 'text' && typeof child.value === 'string') {
                  paragraphText += child.value;
                }
              }
              
              // 检查是否包含 [indent] 标记
              hasIndentTag = paragraphText.includes('[indent]');
            }

            // 移除标记并准备显示内容
            const displayContent = React.Children.map(children, child => {
              if (typeof child === 'string') {
                return child.replace(/\[indent\]/g, '');
              }
              return child;
            });
            
            // 根据是否有标记决定样式 - 默认不缩进，有标记才缩进
            return (
              <p 
                className={`text-lg my-6 ${hasIndentTag ? 'indent-8' : ''}`}
              >
                {displayContent}
              </p>
            );
          },
          
          // 添加列表样式
          ul: ({ children }) => <ul className="list-disc my-2 pl-6 text-lg">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal my-2 pl-6 text-lg">{children}</ol>,
          
          // 自定义列表项渲染器
          li: ({ children, className, ...props }) => {
            // 判断是否为任务列表项
            const isTaskItem = className && className.includes('task-list-item');
            
            if (isTaskItem) {
              return (
                <li className="flex items-start mb-2 pl-1 -ml-1 task-list-item" {...props}>
                  {children}
                </li>
              );
            }
            
            // 常规列表项
            return <li className="mb-2" {...props}>{children}</li>;
          },
          
          // 自定义任务列表复选框
          input: ({ type, checked, readOnly, ...props }) => {
            if (type === 'checkbox') {
              return (
                <span 
                  className={`inline-flex items-center justify-center flex-shrink-0 w-5 h-5 mr-2 -ml-2 mt-1 border rounded ${checked 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-border'}`}
                >
                  {checked && (
                    <svg 
                      className="w-3.5 h-3.5 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2.5" 
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  )}
                </span>
              );
            }
            return <input type={type} readOnly={readOnly} checked={checked} {...props} />;
          },
          
          // 添加表格样式，添加圆角和代码块相同的样式
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <div className="rounded-lg overflow-hidden shadow-md border border-border">
                <table className="min-w-full border-collapse table-auto">
                  {children}
                </table>
              </div>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          tbody: ({ children }) => <tbody className="bg-card divide-y divide-border">{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border last:border-b-0">{children}</tr>,
          th: ({ children, style }) => {
            // 支持列对齐
            let textAlign = 'text-left';
            if (style && style.textAlign) {
              if (style.textAlign === 'center') textAlign = 'text-center';
              if (style.textAlign === 'right') textAlign = 'text-right';
            }
            
            return (
              <th className={`px-4 py-3 ${textAlign} text-sm font-semibold text-foreground border-r border-border last:border-r-0`}>
                {children}
              </th>
            );
          },
          td: ({ children, style }) => {
            // 支持列对齐
            let textAlign = 'text-left';
            if (style && style.textAlign) {
              if (style.textAlign === 'center') textAlign = 'text-center';
              if (style.textAlign === 'right') textAlign = 'text-right';
            }
            
            return (
              <td className={`px-4 py-3 ${textAlign} text-sm text-muted-foreground border-r border-border last:border-r-0`}>
                {children}
              </td>
            );
          },
          
          // 添加引用样式
          blockquote: ({ children }) => (
            <blockquote className="pl-4 border-l-4 border-gray-300 my-6 italic text-gray-700">
              {children}
            </blockquote>
          ),
          
          // 代码块渲染 - 使用客户端组件
          code: CodeComponent,
          
          // 普通链接样式
          a: ({ children, href }) => (
            <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          
          // 添加图片样式 - 使用 Next.js Image 组件优化图片
          img: ({ src, alt, width, height, ...props }) => {
            // 类型守卫：确保 src 存在且为字符串
            if (!src || typeof src !== 'string') {
              console.warn('Image src is missing or not a string');
              return null;
            }
            
            // 设置默认宽高
            const imgWidth = typeof width === 'number' ? width : 800;
            const imgHeight = typeof height === 'number' ? height : 600;
            
            // 如果是外部 URL，使用 Image 组件并设置 domains 或 remotePatterns
            if (src.startsWith('http')) {
              return (
                <Image 
                  src={src} 
                  alt={alt || ''} 
                  width={imgWidth}
                  height={imgHeight}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="max-w-full my-6 rounded shadow-md"
                  style={{ width: '100%', height: 'auto' }}
                  {...props}
                />
              );
            }
            
            // 对于本地图片，使用 Image 组件
            return (
              <Image 
                src={src} 
                alt={alt || ''} 
                width={imgWidth}
                height={imgHeight}
                sizes="(max-width: 768px) 100vw, 800px"
                className="max-w-full my-6 rounded shadow-md"
                style={{ width: '100%', height: 'auto' }}
                {...props}
              />
            );
          },

          // 添加分割线样式
          hr: () => <hr className="my-8 border-t-2 border-gray-300 dark:border-gray-600" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}