import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'teaching-system-theme';

/**
 * 暗色模式 Hook
 * 使用 antd ConfigProvider 的 theme 切换
 * 提供 isDark, toggleTheme 方法
 * 持久化到 localStorage
 */
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored !== null) {
        return stored === 'dark';
      }
    } catch {
      // localStorage 不可用时忽略
    }
    return false;
  });

  // 同步到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const setDarkMode = useCallback((dark) => {
    setIsDark(!!dark);
  }, []);

  return {
    isDark,
    toggleTheme,
    setDarkMode,
  };
};

export default useTheme;