import { useEffect } from 'react';
import { dictionaries, type Locale } from './i18n';

export function getSiteName(locale: Locale): string {
  return dictionaries[locale].siteName;
}

export function withSiteTitle(locale: Locale, title: string): string {
  return `${title} - ${getSiteName(locale)}`;
}

export function useDocumentTitle(title: string | undefined): void {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
}
