import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { useEffect } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import routes from './routes';
import AIChatWrapper from './components/ChatBot';
import { useThemeStore } from './store/useThemeStore';
import appInitService from './services/appInitService';
import './styles/global.scss';

const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

const App = () => {
  const { isDarkMode, setDarkMode } = useThemeStore();

  // Initialize app services and validate token on mount
  useEffect(() => {
    appInitService.initialize();

    // Cleanup on unmount
    return () => {
      appInitService.cleanup();
    };
  }, []);

  // Check for system preferences
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      setDarkMode(true);
    }

    // Listen for changes in system preferences
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  useEffect(() => {
    // Apply dark mode class to body
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Configure Ant Design theme
  const theme = {
    token: {
      colorPrimary: isDarkMode ? '#79eac0' : '#1677ff',
      borderRadius: 6,
    },
    algorithm: isDarkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    components: {
      Button: isDarkMode ? {
        colorPrimaryText: '#000000',
      } : {}
    }
  };

  return (
    <ConfigProvider theme={theme}>
      <Router>
        <AppRoutes />
        <AIChatWrapper version="enhanced" />
      </Router>
    </ConfigProvider>
  );
};

export default App;
