'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  // Load saved theme from localStorage only after component mounts (client-side)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('morph_theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        requestAnimationFrame(() => {
          setThemeState(savedTheme);
        });
      }
    } catch {
      // localStorage may be unavailable in private browsing
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('morph_theme', next);
      }
      return next;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('morph_theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div className={theme === 'dark' ? 'dark' : 'light'} suppressHydrationWarning>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
