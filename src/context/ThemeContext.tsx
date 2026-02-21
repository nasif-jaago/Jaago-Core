import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'mode-b' | 'mode-c';
export type ViewMode = 'desktop' | 'tablet' | 'mobile';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  cycleViewMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem('viewMode') as ViewMode) || 'desktop';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('viewMode', mode);
  };

  const cycleTheme = () => {
    const modes: Theme[] = ['dark', 'mode-b', 'mode-c'];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  const cycleViewMode = () => {
    const modes: ViewMode[] = ['desktop', 'tablet', 'mobile'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
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

  // Handle Simulated View Mode Class
  useEffect(() => {
    document.body.classList.remove('view-desktop', 'view-tablet', 'view-mobile');
    document.body.classList.add(`view-${viewMode}`);
  }, [viewMode]);

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, cycleTheme,
      viewMode, setViewMode, cycleViewMode
    }}>
      <div
        className={`view-wrapper view-${viewMode}`}
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--bg-deep)',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          overflow: 'hidden'
        }}
      >
        <div
          className="simulated-browser"
          style={{
            width: viewMode === 'desktop' ? '100%' : viewMode === 'tablet' ? 'min(95vw, 768px)' : 'min(95vw, 375px)',
            height: viewMode === 'desktop' ? '100%' : 'min(90vh, 812px)',
            borderRadius: viewMode === 'desktop' ? '0' : '32px',
            border: viewMode === 'desktop' ? 'none' : '8px solid #1a1a1a',
            overflow: 'hidden',
            background: 'var(--bg-deep)',
            boxShadow: viewMode === 'desktop' ? 'none' : '0 50px 100px rgba(0,0,0,0.5)',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative'
          }}
        >
          {children}
        </div>
      </div>
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
