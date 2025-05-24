import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider, useAtom } from 'jotai';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastContainer } from './src/components/feedback/Toast';
import { ErrorBoundary } from './src/components/feedback/ErrorBoundary';
import { LoadingOverlay } from './src/components/feedback/LoadingOverlay';
import { colors } from './src/theme';
import { useAuth } from './src/hooks/useAuth';
import { setupIcons } from '@/utils/iconSetup';
import { eventBus } from '@/utils/eventBus';
import { isAuthenticatedAtom, addToastAtom } from '@/store';

// Ignore specific warnings
LogBox.ignoreLogs([
  'useInsertionEffect',
  'ReactDOM.render is no longer supported',
]);

const AppContent: React.FC = () => {
  const { checkAuthStatus } = useAuth();
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, addToast] = useAtom(addToastAtom);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Handle authentication errors (e.g., expired tokens)
    const authErrorListener = (message: string) => {
      // Display error message to user
      addToast({
        message: message || 'Session expired. Please log in again.',
        type: 'error',
        duration: 5000,
      });

      // Update authentication state to trigger navigation to login
      setIsAuthenticated(false);
    };

    // Register event listener
    eventBus.on('AUTH_ERROR', authErrorListener);

    // Clean up event listener on unmount
    return () => {
      eventBus.off('AUTH_ERROR', authErrorListener);
    };
  }, [setIsAuthenticated, addToast]);

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
  }, []);

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
