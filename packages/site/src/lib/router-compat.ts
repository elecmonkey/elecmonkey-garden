import { useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  useSearchParams as useReactRouterSearchParams,
} from 'react-router';

export function usePathname(): string {
  return useLocation().pathname;
}

export function useSearchParams(): URLSearchParams {
  const [searchParams] = useReactRouterSearchParams();
  return searchParams;
}

export function useRouter() {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      push: (href: string) => navigate(href),
      replace: (href: string) => navigate(href, { replace: true }),
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => undefined,
    }),
    [navigate],
  );
}
