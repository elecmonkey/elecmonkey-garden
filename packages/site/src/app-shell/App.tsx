import { RouterProvider, createBrowserRouter, matchRoutes } from 'react-router';
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
  return <RouterProvider router={router} />;
}
