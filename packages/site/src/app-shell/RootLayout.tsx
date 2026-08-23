import { Outlet } from 'react-router';
import AnalyticsScript from '@/components/AnalyticsScript';
import NavigationProgress from '@/components/NavigationProgress';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import RouteScrollRestoration from '@/components/RouteScrollRestoration';
import { ThemeProvider } from '@/components/ThemeProvider';
import type { Locale } from '@/lib/i18n';

export function RootLayout({ locale }: { locale: Locale }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <AnalyticsScript />
      <RouteScrollRestoration />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NavigationProgress locale={locale} />
        <Navbar locale={locale} />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer locale={locale} />
      </ThemeProvider>
    </div>
  );
}
