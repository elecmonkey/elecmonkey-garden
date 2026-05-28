import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

const scrollPositions = new Map<string, number>();

export default function RouteScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousKeyRef = useRef(location.key);
  const didHydrateRef = useRef(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    if (!didHydrateRef.current) {
      didHydrateRef.current = true;
      return;
    }

    scrollPositions.set(previousKeyRef.current, window.scrollY);

    const nextY = navigationType === 'POP'
      ? scrollPositions.get(location.key) ?? 0
      : 0;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: nextY, left: 0, behavior: 'smooth' });
    });

    previousKeyRef.current = location.key;
  }, [location.key, navigationType]);

  return null;
}
