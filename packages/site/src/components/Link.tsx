import * as React from 'react';
import { Link as RouterLink } from 'react-router';

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

export default function Link({ href, replace, prefetch: _prefetch, scroll: _scroll, ...props }: GardenLinkProps) {
  if (typeof href === 'string' && isInternalHref(href)) {
    return <RouterLink to={href} replace={replace} {...props} />;
  }

  return <a href={href} {...props} />;
}
