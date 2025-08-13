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

const AppContent: React.FC = () => {
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, addToast] = useAtom(addToastAtom);
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

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
        await setupIcons();
        console.log('✅ App initialization completed');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
      }
    };

    initialize();
  }, []);

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
