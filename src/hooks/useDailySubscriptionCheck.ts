import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '../store';
import { useSubscription } from './useSubscription';

const LAST_SUBSCRIPTION_CHECK_KEY = 'lastSubscriptionCheck';

interface SubscriptionCheckConfig {
  intervalMinutes?: number;
  enableDebugLogs?: boolean;
}

export const useDailySubscriptionCheck = (
  config: SubscriptionCheckConfig = {},
) => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const { fetchSubscriptionStats } = useSubscription();

  // Default to 5 minutes if not specified
  const intervalMinutes = config.intervalMinutes ?? 5;
  const enableDebugLogs = config.enableDebugLogs ?? true;

  // Use ref to prevent multiple simultaneous checks
  const isCheckingRef = useRef(false);
  const lastLogTimeRef = useRef(0);

  const debugLog = useCallback(
    (message: string, ...args: any[]) => {
      if (enableDebugLogs) {
        const now = Date.now();
        const timestamp = new Date(now).toLocaleTimeString();
        console.log(`[${timestamp}] 📅 SubscriptionCheck: ${message}`, ...args);
        lastLogTimeRef.current = now;
      }
    },
    [enableDebugLogs],
  );

  // Get detailed time information
  const getDetailedTimeInfo = useCallback(async () => {
    try {
      const lastCheckString = await AsyncStorage.getItem(
        LAST_SUBSCRIPTION_CHECK_KEY,
      );
      const now = new Date();

      if (!lastCheckString) {
        return {
          lastCheck: null,
          minutesSinceLastCheck: Infinity,
          shouldCheck: true,
          nextCheckTime: now,
        };
      }

      const lastCheck = new Date(lastCheckString);
      const minutesSinceLastCheck =
        (now.getTime() - lastCheck.getTime()) / (1000 * 60);
      const shouldCheck = minutesSinceLastCheck >= intervalMinutes;
      const nextCheckTime = new Date(
        lastCheck.getTime() + intervalMinutes * 60 * 1000,
      );

      return {
        lastCheck,
        minutesSinceLastCheck,
        shouldCheck,
        nextCheckTime,
      };
    } catch (error) {
      debugLog('Error getting time info:', error);
      return {
        lastCheck: null,
        minutesSinceLastCheck: Infinity,
        shouldCheck: true,
        nextCheckTime: new Date(),
      };
    }
  }, [intervalMinutes, debugLog]);

  // Check if we need to fetch subscription stats
  const shouldCheckSubscription = useCallback(async (): Promise<boolean> => {
    const timeInfo = await getDetailedTimeInfo();

    debugLog(
      `Time check - Minutes since last: ${timeInfo.minutesSinceLastCheck.toFixed(
        2,
      )}, Interval: ${intervalMinutes}, Should check: ${timeInfo.shouldCheck}`,
    );

    return timeInfo.shouldCheck;
  }, [intervalMinutes, debugLog, getDetailedTimeInfo]);

  // Save the current date as last check date
  const saveLastCheckDate = useCallback(async () => {
    try {
      const now = new Date();
      const isoString = now.toISOString();
      await AsyncStorage.setItem(LAST_SUBSCRIPTION_CHECK_KEY, isoString);
      debugLog(
        `Saved check timestamp: ${isoString} (${now.toLocaleTimeString()})`,
      );
    } catch (error) {
      debugLog('Error saving last check date:', error);
    }
  }, [debugLog]);

  // Clear the last check date (for testing)
  const clearLastCheckDate = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(LAST_SUBSCRIPTION_CHECK_KEY);
      debugLog('Cleared last check timestamp');
    } catch (error) {
      debugLog('Error clearing last check date:', error);
    }
  }, [debugLog]);

  // Perform subscription check
  const performSubscriptionCheck = useCallback(
    async (source: string = 'unknown') => {
      if (!isAuthenticated) {
        debugLog(`Skipping check from ${source} - not authenticated`);
        return false;
      }

      if (isCheckingRef.current) {
        debugLog(`Skipping check from ${source} - already checking`);
        return false;
      }

      try {
        isCheckingRef.current = true;
        debugLog(`Starting check from ${source}...`);

        const needsCheck = await shouldCheckSubscription();

        if (needsCheck) {
          debugLog(
            `Performing subscription check (interval: ${intervalMinutes} min, source: ${source})`,
          );

          const startTime = Date.now();
          await fetchSubscriptionStats();
          const endTime = Date.now();

          await saveLastCheckDate();
          debugLog(`Check completed in ${endTime - startTime}ms`);

          return true;
        } else {
          const timeInfo = await getDetailedTimeInfo();
          const minutesUntilNext =
            intervalMinutes - timeInfo.minutesSinceLastCheck;
          debugLog(
            `Check not needed from ${source}, next check in ${minutesUntilNext.toFixed(
              2,
            )} minutes`,
          );

          return false;
        }
      } catch (error) {
        debugLog(`Error during check from ${source}:`, error);
        return false;
      } finally {
        isCheckingRef.current = false;
      }
    },
    [
      isAuthenticated,
      shouldCheckSubscription,
      fetchSubscriptionStats,
      saveLastCheckDate,
      intervalMinutes,
      debugLog,
      getDetailedTimeInfo,
    ],
  );

  // Handle app state changes
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      debugLog(`App state changed to: ${nextAppState}`);

      if (nextAppState === 'active' && isAuthenticated) {
        debugLog('App became active, scheduling check...');
        // Small delay to ensure the app is fully active
        setTimeout(() => {
          performSubscriptionCheck('app-foreground');
        }, 500);
      }
    },
    [isAuthenticated, performSubscriptionCheck, debugLog],
  );

  // Set up app state listener and initial check
  useEffect(() => {
    debugLog(`Hook initialized with ${intervalMinutes} minute interval`);

    if (!isAuthenticated) {
      debugLog('User not authenticated, skipping setup');
      return;
    }

    // Perform initial check when user becomes authenticated
    debugLog('User authenticated, performing initial check...');
    performSubscriptionCheck('initial-auth');

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    debugLog('App state listener registered');

    return () => {
      debugLog('Cleaning up app state listener');
      subscription?.remove();
    };
  }, [
    isAuthenticated,
    performSubscriptionCheck,
    handleAppStateChange,
    intervalMinutes,
    debugLog,
  ]);

  // Set up a timer for regular checks (in addition to app state changes)
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    debugLog(`Setting up timer for ${intervalMinutes} minute intervals`);

    const intervalMs = intervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      debugLog('Timer triggered, performing check...');
      performSubscriptionCheck('timer');
    }, intervalMs);

    return () => {
      debugLog('Cleaning up timer');
      clearInterval(timer);
    };
  }, [isAuthenticated, intervalMinutes, performSubscriptionCheck, debugLog]);

  // Force check function
  const forceSubscriptionCheck = useCallback(async () => {
    debugLog('Force check requested');

    if (!isAuthenticated) {
      debugLog('User not authenticated, cannot force check');
      return false;
    }

    try {
      debugLog('Forcing subscription check...');
      const startTime = Date.now();
      await fetchSubscriptionStats();
      const endTime = Date.now();

      await saveLastCheckDate();
      debugLog(`Forced check completed in ${endTime - startTime}ms`);

      return true;
    } catch (error) {
      debugLog('Error during forced check:', error);
      return false;
    }
  }, [isAuthenticated, fetchSubscriptionStats, saveLastCheckDate, debugLog]);

  // Get debug info
  const getDebugInfo = useCallback(async () => {
    const timeInfo = await getDetailedTimeInfo();
    return {
      ...timeInfo,
      intervalMinutes,
      isAuthenticated,
      isChecking: isCheckingRef.current,
      lastLogTime: lastLogTimeRef.current,
    };
  }, [getDetailedTimeInfo, intervalMinutes, isAuthenticated]);

  return {
    performDailyCheck: performSubscriptionCheck,
    forceSubscriptionCheck,
    shouldCheckSubscription,
    getTimeUntilNextCheck: getDetailedTimeInfo,
    getDebugInfo,
    clearLastCheckDate, // For testing
    intervalMinutes,
  };
};
