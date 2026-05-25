import { Outlet } from 'react-router';
import AnalyticsScript from '@/components/AnalyticsScript';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <AnalyticsScript />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </ThemeProvider>
    </div>
  );
}
