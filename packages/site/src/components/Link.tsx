import * as React from 'react';
import { Link as RouterLink } from 'react-router';
import { prefetchHref } from '@/lib/client-prefetch';

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

type GardenLinkProps = Omit<AnchorProps, 'href'> & {
  href: AnchorProps['href'];
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean | null;
};

function isInternalHref(href: string): boolean {
  return href.startsWith('/') || href.startsWith('#') || href.startsWith('?');
}

export default function Link({ href, replace, prefetch, scroll: _scroll, ...props }: GardenLinkProps) {
  if (typeof href === 'string' && isInternalHref(href)) {
    const prefetchOnIntent = () => {
      if (prefetch) {
        prefetchHref(href, 'intent');
      }
    };

    return (
      <RouterLink
        to={href}
        replace={replace}
        {...props}
        onFocus={(event) => {
          prefetchOnIntent();
          props.onFocus?.(event);
        }}
        onPointerEnter={(event) => {
          prefetchOnIntent();
          props.onPointerEnter?.(event);
        }}
        onTouchStart={(event) => {
          prefetchOnIntent();
          props.onTouchStart?.(event);
        }}
      />
    );
  }

  return <a href={href} {...props} />;
}
