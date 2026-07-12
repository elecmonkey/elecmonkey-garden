import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, matchRoutes } from 'react-router';
import { syncPrefetchNavigation } from '@/lib/client-prefetch';
import { routes } from './routes';

function getHydrationData() {
  if (typeof document === 'undefined' || !document.getElementById('root')?.hasChildNodes()) {
    return undefined;
  }

  const loaderData = Object.fromEntries(
    (matchRoutes(routes, window.location.pathname) ?? []).flatMap(({ route }) => (
      route.id ? [[route.id, null]] : []
    )),
  );

  return { loaderData };
}

const router = createBrowserRouter(routes, { hydrationData: getHydrationData() });

export function App() {
  useEffect(() => {
    const syncPrefetchState = () => {
      const { location, navigation } = router.state;
      syncPrefetchNavigation(
        navigation.state !== 'idle',
        `${location.pathname}${location.search}`,
      );
    };

    syncPrefetchState();
    return router.subscribe(syncPrefetchState);
  }, []);

  return <RouterProvider router={router} />;
}
