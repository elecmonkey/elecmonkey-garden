'use client';

import dynamic from 'next/dynamic';

const TableOfContents = dynamic(() => import('./TableOfContents'), {
  ssr: false,
});

export default function ClientTableOfContents() {
  return <TableOfContents />;
} 