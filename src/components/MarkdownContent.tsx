import ReactMarkdown from 'react-markdown';
import { CodeComponent } from './ClientMarkdownRenderer';
import Image from 'next/image';
import React from 'react';
import remarkGfm from 'remark-gfm';

// 服务器端组件包装器
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-content text-lg leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 添加各级标题的样式
          h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold mt-5 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-lg font-bold mt-4 mb-2">{children}</h4>,
          h5: ({ children }) => <h5 className="text-base font-bold mt-3 mb-1">{children}</h5>,
          h6: ({ children }) => <h6 className="text-sm font-bold mt-3 mb-1">{children}</h6>,
          
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
                className={`mb-6 text-lg ${hasIndentTag ? 'indent-8' : ''}`}
              >
                {displayContent}
              </p>
            );
          },
          
          // 添加列表样式
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 mt-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 mt-2">{children}</ol>,
          
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
                    ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600' 
                    : 'border-gray-400 dark:border-gray-600'}`}
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
              <div className="rounded-lg overflow-hidden shadow-md border border-gray-300 dark:border-gray-700">
                <table className="min-w-full border-collapse table-auto">
                  {children}
                </table>
              </div>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">{children}</tr>,
          th: ({ children, style }) => {
            // 支持列对齐
            let textAlign = 'text-left';
            if (style && style.textAlign) {
              if (style.textAlign === 'center') textAlign = 'text-center';
              if (style.textAlign === 'right') textAlign = 'text-right';
            }
            
            return (
              <th className={`px-4 py-3 ${textAlign} text-sm font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0`}>
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
              <td className={`px-4 py-3 ${textAlign} text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0`}>
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
            // 检查 src 是否存在
            if (!src) return null;
            
            // 设置默认宽高
            const imgWidth = typeof width === 'number' ? width : 800;
            const imgHeight = typeof height === 'number' ? height : 600;
            
            // 如果是外部 URL，使用 Image 组件并设置 domains 或 remotePatterns
            if (src.startsWith('http')) {
              return (
                <div className="my-6 overflow-hidden rounded shadow-md">
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
              <div className="my-6 overflow-hidden rounded shadow-md">
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
    </div>
  );
} 