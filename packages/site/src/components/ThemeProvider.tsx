"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from '@/lib/theme-compat';
import type { ThemeProviderProps } from '@/lib/theme-compat';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
