import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode } from '../types';

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
  isDark: boolean;
  isMidnight: boolean;
  isCyber: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('m7r_theme');
    if (saved === 'midnight' || saved === 'cyber' || saved === 'dark') {
      return saved as ThemeMode;
    }
    return 'dark';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('m7r_theme', newTheme);
  };

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('midnight');
    else if (theme === 'midnight') setTheme('cyber');
    else setTheme('dark');
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        isDark: theme === 'dark',
        isMidnight: theme === 'midnight',
        isCyber: theme === 'cyber'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
