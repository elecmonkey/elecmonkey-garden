import {
  FileText,
  FileImage,
  File,
  FileCode,
  FileJson,
  FileType,
  Download,
  FileArchive
} from 'lucide-react';

interface FileDownloadProps {
  fileContent: string; // 原始的五行文本内容
  className?: string;
}

interface FileInfo {
  filename: string;
  type: string;
  url: string;
  description: string;
  size: string;
}

// 纯服务端组件，不需要 'use client'
export default function ServerFileDownloadRenderer({ fileContent, className = '' }: FileDownloadProps) {
  // 解析五行文本为文件信息
  const parseFileContent = (content: string): FileInfo => {
    const lines = content.trim().split('\n');
    
    // 确保至少有 3 行（最低要求：文件名、类型和链接）
    if (lines.length < 3) {
      return {
        filename: '未知文件',
        type: 'unknown',
        url: '#',
        description: '无效的文件信息',
        size: '未知大小'
      };
    }
    
    return {
      filename: lines[0]?.trim() || '未知文件',
      type: lines[1]?.trim().toLowerCase() || 'unknown',
      url: lines[2]?.trim() || '#',
      description: lines[3]?.trim() || '暂无描述',
      size: lines[4]?.trim() || '未知大小'
    };
  };
  
  // 根据文件类型获取图标
  const getFileIcon = (type: string) => {
    const iconProps = { 
      size: 48, // 增大图标尺寸
      strokeWidth: 1.5,
      className: getIconColorClass(type)
    };
    
    switch (type) {
      case 'pdf':
        return <FileText {...iconProps} />;
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return <FileImage {...iconProps} />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <FileArchive {...iconProps} />;
      case 'doc':
      case 'docx':
      case 'word':
        return <FileText {...iconProps} />;
      case 'xls':
      case 'xlsx':
      case 'excel':
        return <FileText {...iconProps} />;
      case 'ppt':
      case 'pptx':
      case 'powerpoint':
        return <FileText {...iconProps} />;
      case 'md':
      case 'markdown':
        return <FileText {...iconProps} />;
      case 'json':
        return <FileJson {...iconProps} />;
      case 'html':
      case 'css':
        return <FileType {...iconProps} />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'c':
      case 'cpp':
      case 'go':
      case 'rust':
      case 'code':
        return <FileCode {...iconProps} />;
      case 'txt':
      case 'text':
        return <FileText {...iconProps} />;
      default:
        // 对于未知类型，使用通用文件图标
        return <File {...iconProps} />;
    }
  };
  
  // 根据文件类型获取图标颜色类
  const getIconColorClass = (type: string): string => {
    switch (type) {
      case 'pdf':
        return 'text-red-500 dark:text-red-400';
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return 'text-blue-500 dark:text-blue-400';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'doc':
      case 'docx':
      case 'word':
        return 'text-blue-700 dark:text-blue-400';
      case 'xls':
      case 'xlsx':
      case 'excel':
        return 'text-green-600 dark:text-green-400';
      case 'ppt':
      case 'pptx':
      case 'powerpoint':
        return 'text-orange-500 dark:text-orange-400';
      case 'md':
      case 'markdown':
        return 'text-gray-600 dark:text-gray-400';
      case 'json':
        return 'text-green-500 dark:text-green-400';
      case 'html':
        return 'text-orange-600 dark:text-orange-400';
      case 'css':
        return 'text-blue-500 dark:text-blue-400';
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'c':
      case 'cpp':
      case 'go':
      case 'rust':
      case 'code':
        return 'text-purple-500 dark:text-purple-400';
      case 'txt':
      case 'text':
        return 'text-gray-500 dark:text-gray-400';
      default:
        // 对于未知类型，使用灰色
        return 'text-gray-500 dark:text-gray-400';
    }
  };
  
  // 获取文件信息
  const fileInfo = parseFileContent(fileContent);
  
  return (
    <div className={`my-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex flex-col sm:flex-row p-4 gap-4">
        <div className="flex flex-shrink-0 items-center justify-center w-16 h-16 mt-2 ml-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {getFileIcon(fileInfo.type)}
        </div>
        
        <div className="flex-grow">
          <h3 className="font-medium text-lg mb-1 text-gray-900 dark:text-gray-100">
            {fileInfo.filename}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {fileInfo.description}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">
              {fileInfo.size}
            </span>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">
              {fileInfo.type.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex items-center mt-3 sm:mt-0">
          <a 
            href={fileInfo.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 mr-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
          >
            <Download className="my-1" size={18} />
          </a>
        </div>
      </div>
    </div>
  );
} 