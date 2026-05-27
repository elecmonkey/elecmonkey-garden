import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { routes } from './app-shell/routes.ssg';

export function render(pathname: string): string {
  const router = createMemoryRouter(routes, {
    initialEntries: [pathname],
  });

  return renderToString(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
