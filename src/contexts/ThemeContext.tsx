import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    // Default to light theme if no stored theme or if stored theme was 'system'
    return (stored === 'light' || stored === 'dark') ? stored : 'light';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (isDarkMode: boolean) => {
      root.classList.remove('light', 'dark');
      root.classList.add(isDarkMode ? 'dark' : 'light');
      setIsDark(isDarkMode);
    };

    applyTheme(theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
