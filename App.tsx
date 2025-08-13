import 'react-native-gesture-handler';
import React, { Suspense, useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { Provider, useAtom } from 'jotai';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastContainer } from './src/components/feedback/Toast';
import { ErrorBoundary } from './src/components/feedback/ErrorBoundary';
import { LoadingOverlay } from './src/components/feedback/LoadingOverlay';
import { colors } from './src/theme';
import { setupIcons } from '@/utils/iconSetup';
import { eventBus } from '@/utils/eventBus';
import { isAuthenticatedAtom, addToastAtom } from '@/store';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/types';
import { useSubscriptionStatusChecker } from '@/hooks/useSubscriptionStatusChecker';

const AppContent: React.FC = () => {
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, addToast] = useAtom(addToastAtom);
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Initialize subscription status checker with 10-minute intervals
  const { performCheck, forceCheck, getDebugInfo, isChecking } =
    useSubscriptionStatusChecker({
      intervalMinutes: 10, // Check every 10 minutes
      enableLogs: __DEV__, // Enable debug logs only in development
      checkOnAppForeground: true, // Check when app comes to foreground
      checkOnAuthentication: true, // Check when user authenticates
    });

  useEffect(() => {
    // Handle authentication errors
    const authErrorListener = (message: string) => {
      addToast({
        message: message || 'Session expired. Please log in again.',
        type: 'error',
        duration: 5000,
      });
      setIsAuthenticated(false);
    };

    // Handle subscription status updates
    const subscriptionUpdateListener = (status: string) => {
      if (__DEV__) {
        console.log('📱 Subscription status updated:', status);
      }

      // Optionally show toast for subscription changes
      if (status === 'expired') {
        addToast({
          message: 'Your subscription has expired. Please renew to continue.',
          type: 'warning',
          duration: 8000,
        });
      }
    };

    eventBus.on('AUTH_ERROR', authErrorListener);
    eventBus.on('SUBSCRIPTION_UPDATED', subscriptionUpdateListener);

    return () => {
      eventBus.off('AUTH_ERROR', authErrorListener);
      eventBus.off('SUBSCRIPTION_UPDATED', subscriptionUpdateListener);
    };
  }, [setIsAuthenticated, addToast]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await setupIcons();
        console.log('✅ App initialization completed');
      } catch (error) {
        if (__DEV__) {
          console.error('❌ Error initializing app:', error);
        }
      }
    };

    initialize();
  }, []);

  // Add development helper functions
  useEffect(() => {
    if (__DEV__) {
      // Make subscription checker functions available globally for debugging
      (global as any).subscriptionChecker = {
        forceCheck,
        getDebugInfo,
        performCheck,
        isChecking,
      };

      console.log(
        '🛠️ Development: Subscription checker methods available globally',
      );
      console.log('Usage: global.subscriptionChecker.forceCheck()');
      console.log('Check status: global.subscriptionChecker.isChecking');
    }
  }, [forceCheck, getDebugInfo, performCheck, isChecking]);

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
        <Suspense fallback={<LoadingOverlay message="Loading..." />}>
          <AppContent />
        </Suspense>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
