import * as React from 'react';
import { Link as RouterLink } from 'react-router';
import { prefetchHref } from '@/lib/client-prefetch';

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
const HOVER_PREFETCH_DELAY_MS = 100;

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
  const hoverTimerRef = React.useRef<number | null>(null);

  const cancelHoverPrefetch = () => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  React.useEffect(() => () => {
    cancelHoverPrefetch();
  }, [href]);

  if (typeof href === 'string' && isInternalHref(href)) {
    const prefetchOnIntent = () => {
      if (prefetch) {
        prefetchHref(href);
      }
    };

    const prefetchAfterHoverDwell = () => {
      if (!prefetch || hoverTimerRef.current !== null) return;

      hoverTimerRef.current = window.setTimeout(() => {
        hoverTimerRef.current = null;
        prefetchHref(href);
      }, HOVER_PREFETCH_DELAY_MS);
    };

    return (
      <RouterLink
        to={href}
        replace={replace}
        {...props}
        onFocus={(event) => {
          cancelHoverPrefetch();
          prefetchOnIntent();
          props.onFocus?.(event);
        }}
        onPointerEnter={(event) => {
          prefetchAfterHoverDwell();
          props.onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          cancelHoverPrefetch();
          props.onPointerLeave?.(event);
        }}
      />
    );
  }

  return <a href={href} {...props} />;
}
