import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'mode-b' | 'mode-c';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const cycleTheme = () => {
    const modes: Theme[] = ['dark', 'mode-b', 'mode-c'];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  useEffect(() => {
    // Remove all possible theme classes
    document.body.classList.remove('mode-b', 'mode-c');
    document.documentElement.setAttribute('data-theme', theme);

    // Add the specific class if it's mode-b or mode-c
    if (theme === 'mode-b') {
      document.body.classList.add('mode-b');
    } else if (theme === 'mode-c') {
      document.body.classList.add('mode-c');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
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
