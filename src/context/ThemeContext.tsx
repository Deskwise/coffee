import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'espresso' | 'sunlight';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage or system preference
    const saved = localStorage.getItem('tmc-theme') as Theme;
    if (saved) return saved;
    return 'espresso'; // Default to Dark
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'sunlight') {
      root.setAttribute('data-theme', 'sunlight');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('tmc-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'espresso' ? 'sunlight' : 'espresso');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
