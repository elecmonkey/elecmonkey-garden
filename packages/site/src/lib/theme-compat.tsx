'use client';

import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';

export type ThemeProviderProps = React.PropsWithChildren<{
  attribute?: 'class' | string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}>;

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const storageKey = 'theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme, enableSystem: boolean, disableTransitionOnChange: boolean): 'light' | 'dark' {
  const resolvedTheme = theme === 'system' && enableSystem ? getSystemTheme() : theme === 'dark' ? 'dark' : 'light';
  const root = document.documentElement;

  if (!disableTransitionOnChange) {
    root.classList.add('transitioning');
    window.setTimeout(() => root.classList.remove('transitioning'), 200);
  }

  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.style.colorScheme = resolvedTheme;
  return resolvedTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;
    const initialTheme = storedTheme ?? defaultTheme;
    setThemeState(initialTheme);
    setResolvedTheme(applyTheme(initialTheme, enableSystem, disableTransitionOnChange));
  }, [defaultTheme, disableTransitionOnChange, enableSystem]);

  React.useEffect(() => {
    if (!enableSystem || theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => setResolvedTheme(applyTheme('system', enableSystem, disableTransitionOnChange));
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [disableTransitionOnChange, enableSystem, theme]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      window.localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
      setResolvedTheme(applyTheme(nextTheme, enableSystem, disableTransitionOnChange));
    },
    [disableTransitionOnChange, enableSystem],
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: () => undefined,
    };
  }
  return context;
}
