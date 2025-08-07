import 'react-native-gesture-handler';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { StatusBar, Linking } from 'react-native';
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
import { useDailySubscriptionCheck } from '@/hooks/useDailySubscriptionCheck';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/types';

const AppContent: React.FC = () => {
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, addToast] = useAtom(addToastAtom);
  const { checkAuthStatus } = useAuth();

  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Initialize 60-minute subscription check with debug logging
  const subscriptionCheck = useDailySubscriptionCheck({
    intervalMinutes: 60, // Check every 60 minutes
    enableDebugLogs: false, // Enable detailed logging
  });

  const handleDeepLink = (url: string) => {
    try {
      console.log('🔗 Processing deep link:', url);

      // Add your existing deep link processing logic here
    } catch (error) {
      console.error('❌ Error processing deep link:', error);
      addToast({
        message: 'Failed to process link. Please try again.',
        type: 'error',
        duration: 4000,
      });
    }
  };

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

    eventBus.on('AUTH_ERROR', authErrorListener);
    return () => {
      eventBus.off('AUTH_ERROR', authErrorListener);
    };
  }, [setIsAuthenticated, addToast]);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Initializing app with 5-minute subscription checks...');

        await setupIcons();
        await checkAuthStatus();

        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('📱 Initial URL found:', initialUrl);
          setTimeout(() => {
            handleDeepLink(initialUrl);
          }, 1000);
        }

        console.log('✅ App initialization completed');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
      }
    };

    initialize();
  }, [checkAuthStatus]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('📱 Deep link received while app open:', url);
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, [addToast]);

  // Development helpers
  useEffect(() => {
    if (__DEV__) {
      // Add debug functions to global scope
      (global as any).forceSubscriptionCheck =
        subscriptionCheck.forceSubscriptionCheck;
      (global as any).getSubscriptionDebugInfo = subscriptionCheck.getDebugInfo;
      (global as any).clearSubscriptionCheck =
        subscriptionCheck.clearLastCheckDate;

      console.log('🔧 Development debug functions available:');
      console.log(
        '- global.forceSubscriptionCheck() - Force subscription check',
      );
      console.log(
        '- global.getSubscriptionDebugInfo() - Get detailed debug info',
      );
      console.log(
        '- global.clearSubscriptionCheck() - Clear last check timestamp',
      );
      console.log('📅 Subscription check interval: 5 minutes');
    }
  }, [subscriptionCheck]);

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
