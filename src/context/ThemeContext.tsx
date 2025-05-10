import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme, PaletteMode } from '@mui/material';

// 定义深色主题
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

// 定义浅色主题
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e91e63',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

// 定义主题上下文类型
type ThemeContextType = {
  mode: PaletteMode;
  toggleTheme: () => void;
  theme: Theme;
};

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件的Props
interface ThemeProviderProps {
  children: ReactNode;
}

// 主题提供者组件
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // 从localStorage获取保存的主题设置，默认为深色模式
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'dark';
  });

  // 根据当前模式选择对应主题
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  // 切换主题模式
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
  };

  // 当主题模式变化时，保存到localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// 自定义Hook，便于组件中使用主题
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}; 