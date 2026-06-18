import React, { createContext, useContext, useMemo } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import useTheme from '../hooks/useTheme';

const ThemeContext = createContext(null);

/**
 * 全局主题 Context
 * 包裹 App，提供主题切换能力
 */
export const ThemeProvider = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();

  const themeConfig = useMemo(
    () => ({
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 6,
      },
    }),
    [isDark]
  );

  const contextValue = useMemo(
    () => ({ isDark, toggleTheme }),
    [isDark, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider locale={zhCN} theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

/**
 * 使用主题 Context 的 Hook
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;