import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '../store';
import { useSubscription } from './useSubscription';

const SUBSCRIPTION_CHECK_KEY = 'lastSubscriptionStatusCheck';

interface UseSubscriptionStatusCheckerProps {
  intervalMinutes?: number;
  enableLogs?: boolean;
  checkOnAppForeground?: boolean;
  checkOnAuthentication?: boolean;
}

export const useSubscriptionStatusChecker = ({
  intervalMinutes = 10,
  enableLogs = false,
  checkOnAppForeground = true,
  checkOnAuthentication = true,
}: UseSubscriptionStatusCheckerProps = {}) => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const { fetchSubscriptionStats } = useSubscription();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef<number | null>(null);

  const log = useCallback(
    (message: string, ...args: any[]) => {
      if (enableLogs) {
        console.log(`[SubscriptionChecker] ${message}`, ...args);
      }
    },
    [enableLogs],
  );

  // Get last check time from AsyncStorage
  const getLastCheckTime = useCallback(async (): Promise<number | null> => {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_CHECK_KEY);
      return stored ? parseInt(stored, 10) : null;
    } catch (error) {
      log('Error getting last check time:', error);
      return null;
    }
  }, [log]);

  // Save current time as last check
  const saveLastCheckTime = useCallback(
    async (timestamp: number = Date.now()) => {
      try {
        await AsyncStorage.setItem(
          SUBSCRIPTION_CHECK_KEY,
          timestamp.toString(),
        );
        lastCheckRef.current = timestamp;
        log(`Saved check time: ${new Date(timestamp).toLocaleTimeString()}`);
      } catch (error) {
        log('Error saving last check time:', error);
      }
    },
    [log],
  );

  // Check if we should perform subscription check
  const shouldCheck = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const lastCheck = await getLastCheckTime();
    if (!lastCheck) return true;

    const now = Date.now();
    const timeSinceCheck = now - lastCheck;
    const intervalMs = intervalMinutes * 60 * 1000;

    const should = timeSinceCheck >= intervalMs;
    log(
      `Time since last check: ${Math.round(
        timeSinceCheck / 1000 / 60,
      )} minutes, should check: ${should}`,
    );

    return should;
  }, [isAuthenticated, getLastCheckTime, intervalMinutes, log]);

  // Perform the actual subscription check
  const performCheck = useCallback(
    async (source: string = 'unknown'): Promise<boolean> => {
      if (isCheckingRef.current) {
        log(`Check already in progress, skipping (${source})`);
        return false;
      }

      if (!isAuthenticated) {
        log(`Not authenticated, skipping check (${source})`);
        return false;
      }

      const needsCheck = await shouldCheck();
      if (!needsCheck) {
        log(`Check not needed yet (${source})`);
        return false;
      }

      try {
        isCheckingRef.current = true;
        log(`Starting subscription check (${source})`);

        const startTime = Date.now();
        await fetchSubscriptionStats();
        const endTime = Date.now();

        await saveLastCheckTime(endTime);
        log(`Check completed in ${endTime - startTime}ms (${source})`);

        return true;
      } catch (error) {
        log(`Check failed (${source}):`, error);
        return false;
      } finally {
        isCheckingRef.current = false;
      }
    },
    [
      isAuthenticated,
      shouldCheck,
      fetchSubscriptionStats,
      saveLastCheckTime,
      log,
    ],
  );

  // Force check (ignores interval)
  const forceCheck = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      log('Cannot force check - not authenticated');
      return false;
    }

    try {
      isCheckingRef.current = true;
      log('Forcing subscription check');

      await fetchSubscriptionStats();
      await saveLastCheckTime();

      log('Forced check completed');
      return true;
    } catch (error) {
      log('Forced check failed:', error);
      return false;
    } finally {
      isCheckingRef.current = false;
    }
  }, [isAuthenticated, fetchSubscriptionStats, saveLastCheckTime, log]);

  // Handle app state changes
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      log(`App state changed to: ${nextAppState}`);

      if (nextAppState === 'active' && checkOnAppForeground) {
        // Small delay to ensure app is fully active
        setTimeout(() => {
          performCheck('app-foreground');
        }, 1000);
      }
    },
    [checkOnAppForeground, performCheck, log],
  );

  // Setup timer for regular checks
  const setupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    log(`Setting up timer for ${intervalMinutes} minute intervals`);

    timerRef.current = setInterval(() => {
      performCheck('timer');
    }, intervalMs);
  }, [intervalMinutes, performCheck, log]);

  // Cleanup timer
  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      log('Timer cleared');
    }
  }, [log]);

  // Main effect - setup listeners and initial check
  useEffect(() => {
    if (!isAuthenticated) {
      cleanupTimer();
      log('User not authenticated, cleaned up timers');
      return;
    }

    log(`Initializing subscription checker (${intervalMinutes} min interval)`);

    // Initial check when user becomes authenticated
    if (checkOnAuthentication) {
      performCheck('authentication');
    }

    // Setup regular timer
    setupTimer();

    // Setup app state listener
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      cleanupTimer();
      subscription?.remove();
      log('Cleaned up subscription checker');
    };
  }, [
    isAuthenticated,
    intervalMinutes,
    checkOnAuthentication,
    performCheck,
    setupTimer,
    cleanupTimer,
    handleAppStateChange,
    log,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  // Get debug information
  const getDebugInfo = useCallback(async () => {
    const lastCheck = await getLastCheckTime();
    const now = Date.now();
    const timeSinceCheck = lastCheck ? now - lastCheck : null;
    const minutesSinceCheck = timeSinceCheck
      ? Math.round(timeSinceCheck / 1000 / 60)
      : null;

    return {
      isAuthenticated,
      isChecking: isCheckingRef.current,
      lastCheck: lastCheck ? new Date(lastCheck) : null,
      minutesSinceLastCheck: minutesSinceCheck,
      intervalMinutes,
      nextCheckIn: minutesSinceCheck
        ? Math.max(0, intervalMinutes - minutesSinceCheck)
        : null,
    };
  }, [getLastCheckTime, isAuthenticated, intervalMinutes]);

  return {
    performCheck,
    forceCheck,
    shouldCheck,
    getDebugInfo,
    isChecking: isCheckingRef.current,
  };
};
