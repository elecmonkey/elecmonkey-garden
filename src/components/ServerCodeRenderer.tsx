import CodeBlock from './CodeBlock';

export default function ServerCodeRenderer({ 
  language, 
  code, 
  ...props 
}: { 
  language: string, 
  code: string, 
  [key: string]: unknown 
}) {
  return (
    <div className="relative">
      <CodeBlock 
        language={language} 
        code={code}
        {...props}
      />
    </div>
  );
} 