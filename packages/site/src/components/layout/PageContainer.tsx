import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`max-w-6xl mx-auto py-10 px-4 mb-10 ${className}`}>
      {children}
    </div>
  );
} 