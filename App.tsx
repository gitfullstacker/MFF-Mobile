import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'jotai';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastContainer } from './src/components/feedback/Toast';
import { ErrorBoundary } from './src/components/feedback/ErrorBoundary';
import { LoadingOverlay } from './src/components/feedback/LoadingOverlay';
import { colors } from './src/theme';
import { useAuth } from './src/hooks/useAuth';
import { setupIcons } from '@/utils/iconSetup';

// Ignore specific warnings
LogBox.ignoreLogs([
  'useInsertionEffect',
  'ReactDOM.render is no longer supported',
]);

const AppContent: React.FC = () => {
  const { checkAuthStatus } = useAuth();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Setup icons
        await setupIcons();

        // Check auth status
        await checkAuthStatus();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [checkAuthStatus]);

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading..." />;
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background.light}
      />
      <AppNavigator />
      <ToastContainer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
