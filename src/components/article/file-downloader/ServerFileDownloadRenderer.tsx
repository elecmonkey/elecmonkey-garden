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
      size: 48,
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
        return 'text-destructive';
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return 'text-primary';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return 'text-yellow-500'; // 保留黄色，作为一种强调
      case 'doc':
      case 'docx':
      case 'word':
        return 'text-primary';
      case 'xls':
      case 'xlsx':
      case 'excel':
        return 'text-green-600'; // 保留绿色
      case 'ppt':
      case 'pptx':
      case 'powerpoint':
        return 'text-orange-500'; // 保留橙色
      case 'md':
      case 'markdown':
        return 'text-muted-foreground';
      case 'json':
        return 'text-green-500'; // 保留绿色
      case 'html':
        return 'text-orange-600'; // 保留橙色
      case 'css':
        return 'text-primary';
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
        return 'text-purple-500'; // 保留紫色
      case 'txt':
      case 'text':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };
  
  // 获取文件信息
  const fileInfo = parseFileContent(fileContent);
  
  return (
    <div className={`my-6 rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-card ${className}`}>
      <div className="flex flex-col sm:flex-row px-4 pt-4 pb-8 sm:pb-4 gap-4">
        {/* 图标容器 - 在移动端居中 */}
                  <div className="flex flex-shrink-0 items-center justify-center mx-auto sm:mx-0 w-20 h-20 sm:w-16 sm:h-16 mt-2 sm:ml-0.5 bg-muted rounded-lg">
          {getFileIcon(fileInfo.type)}
        </div>
        
        {/* 文件信息 - 在移动端居中对齐文本 */}
        <div className="flex-grow text-center sm:text-left">
          <h3 className="font-medium text-lg mb-1 text-card-foreground">
            {fileInfo.filename}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {fileInfo.description}
          </p>
          <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
            <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
              {fileInfo.size}
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
              {fileInfo.type.toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* 下载按钮 - 在移动端居中 */}
        <div className="flex-shrink-0 flex items-center justify-center sm:justify-start mt-4 sm:mt-0">
          <a 
            href={fileInfo.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 mr-0 sm:mr-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors duration-200"
          >
            <Download className="my-1" size={18} />
          </a>
        </div>
      </div>
    </div>
  );
} 