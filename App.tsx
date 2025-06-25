import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StatusBar, LogBox, Linking } from 'react-native';
import { Provider, useAtom } from 'jotai';
import { NavigationContainerRef } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastContainer } from './src/components/feedback/Toast';
import { ErrorBoundary } from './src/components/feedback/ErrorBoundary';
import { LoadingOverlay } from './src/components/feedback/LoadingOverlay';
import { colors } from './src/theme';
import { useAuth } from './src/hooks/useAuth';
import { setupIcons } from '@/utils/iconSetup';
import { eventBus } from '@/utils/eventBus';
import { isAuthenticatedAtom, addToastAtom } from '@/store';
import { RootStackParamList } from './src/types/navigation';
import { SCREEN_NAMES } from './src/constants/navigation';

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
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Deep Link Handler
  const handleDeepLink = (url: string) => {
    if (!url || !navigationRef.current) {
      return;
    }

    try {
      console.log('📱 Handling deep link:', url);

      // Handle password reset links
      // Expected formats:
      // - https://yourdomain.com/reset-password?token=abc123
      // - mealapp://reset-password?token=abc123
      const resetPasswordRegex = /reset-password.*token=([^&]+)/;
      const resetMatch = url.match(resetPasswordRegex);

      if (resetMatch) {
        const token = resetMatch[1];
        console.log('🔑 Password reset token found:', token);

        // Navigate to ResetPassword screen with token
        navigationRef.current.reset({
          index: 0,
          routes: [
            {
              name: SCREEN_NAMES.ROOT.AUTH,
              params: {
                screen: SCREEN_NAMES.AUTH.RESET_PASSWORD,
                params: { token },
              },
            },
          ],
        });

        addToast({
          message: 'Opening password reset page...',
          type: 'info',
          duration: 3000,
        });

        return;
      }

      // Add other deep link handlers here as needed
      console.log('🤔 Unhandled deep link:', url);
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
      addToast({
        message: 'Unable to open link. Please try again.',
        type: 'error',
        duration: 4000,
      });
    }
  };

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

        // Handle deep link when app opens from closed state
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('📱 Initial URL found:', initialUrl);
          // Delay to ensure navigation is ready
          setTimeout(() => {
            handleDeepLink(initialUrl);
          }, 1000);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('📱 Deep link received while app open:', url);
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, [addToast]);

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading..." />;
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background.light}
      />
      <AppNavigator navigationRef={navigationRef} />
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
