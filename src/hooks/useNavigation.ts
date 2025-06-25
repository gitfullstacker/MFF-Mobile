import { useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useCallback } from 'react';
import type {
  AuthStackParamList,
  MainTabParamList,
  RecipeStackParamList,
  MealPlanStackParamList,
  AccountStackParamList,
  RootStackParamList,
  CompositeAuthNavigationProp,
  CompositeMainTabNavigationProp,
  CompositeRecipeNavigationProp,
  CompositeMealPlanNavigationProp,
  CompositeAccountNavigationProp,
  RootNavigationProp,
  AuthRouteProp,
  MainTabRouteProp,
  RecipeRouteProp,
  MealPlanRouteProp,
  AccountRouteProp,
  RootRouteProp,
} from '../types/navigation';
import { SCREEN_NAMES, NAVIGATION_TIMING } from '../constants/navigation';

/**
 * Typed navigation hook for Auth stack
 */
export const useAuthNavigation = () => {
  return useNavigation<CompositeAuthNavigationProp>();
};

/**
 * Typed navigation hook for Main Tab
 */
export const useMainTabNavigation = <T extends keyof MainTabParamList>() => {
  return useNavigation<CompositeMainTabNavigationProp<T>>();
};

/**
 * Typed navigation hook for Recipe stack
 */
export const useRecipeNavigation = () => {
  return useNavigation<CompositeRecipeNavigationProp>();
};

/**
 * Typed navigation hook for Meal Plan stack
 */
export const useMealPlanNavigation = () => {
  return useNavigation<CompositeMealPlanNavigationProp>();
};

/**
 * Typed navigation hook for Account stack
 */
export const useAccountNavigation = () => {
  return useNavigation<CompositeAccountNavigationProp>();
};

/**
 * Typed navigation hook for Root stack
 */
export const useRootNavigation = () => {
  return useNavigation<RootNavigationProp>();
};

/**
 * Generic typed route hook
 */
export const useTypedRoute = <
  T extends
    | keyof AuthStackParamList
    | keyof MainTabParamList
    | keyof RecipeStackParamList
    | keyof MealPlanStackParamList
    | keyof AccountStackParamList
    | keyof RootStackParamList,
>() => {
  return useRoute<
    | AuthRouteProp<T extends keyof AuthStackParamList ? T : never>
    | MainTabRouteProp<T extends keyof MainTabParamList ? T : never>
    | RecipeRouteProp<T extends keyof RecipeStackParamList ? T : never>
    | MealPlanRouteProp<T extends keyof MealPlanStackParamList ? T : never>
    | AccountRouteProp<T extends keyof AccountStackParamList ? T : never>
    | RootRouteProp<T extends keyof RootStackParamList ? T : never>
  >();
};

/**
 * Debounced navigation to prevent rapid consecutive navigations
 */
export const useDebouncedNavigation = () => {
  const navigation = useNavigation();
  let lastNavigationTime = 0;

  const navigateWithDebounce = useCallback(
    (name: string, params?: any) => {
      const now = Date.now();
      if (now - lastNavigationTime < NAVIGATION_TIMING.DEBOUNCE_TIME) {
        return;
      }
      lastNavigationTime = now;
      navigation.navigate((name as never, params as never));
    },
    [navigation],
  );

  return { navigateWithDebounce };
};

/**
 * Safe navigation hook that checks if navigation is possible
 */
export const useSafeNavigation = () => {
  const navigation = useNavigation();

  const safeNavigate = useCallback(
    (name: string, params?: any) => {
      if (navigation.canGoBack() || navigation?.getState()?.index === 0) {
        navigation.navigate((name as never, params as never));
      }
    },
    [navigation],
  );

  const safeGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const safeReset = useCallback(
    (state: any) => {
      navigation.reset(state);
    },
    [navigation],
  );

  return {
    safeNavigate,
    safeGoBack,
    safeReset,
    canGoBack: navigation.canGoBack(),
  };
};

/**
 * Navigation helpers for common patterns
 */
export const useNavigationHelpers = () => {
  const navigation = useNavigation<RootNavigationProp>();

  const navigateToMainTab = useCallback(
    (tabName: keyof MainTabParamList) => {
      navigation.navigate(SCREEN_NAMES.ROOT.MAIN, {
        screen: tabName,
      });
    },
    [navigation],
  );

  const navigateToForgotPassword = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.AUTH, {
      screen: SCREEN_NAMES.AUTH.FORGOT_PASSWORD,
    });
  }, [navigation]);

  const navigateToRecipeDetail = useCallback(
    (recipeId: string, recipe?: any) => {
      navigation.navigate(SCREEN_NAMES.ROOT.RECIPE_STACK, {
        screen: SCREEN_NAMES.RECIPE.DETAIL,
        params: { recipeId, recipe },
      });
    },
    [navigation],
  );

  const navigateToMealPlanDetail = useCallback(
    (planId: string, plan?: any) => {
      navigation.navigate(SCREEN_NAMES.ROOT.MEAL_PLAN_STACK, {
        screen: SCREEN_NAMES.MEAL_PLAN.DETAIL,
        params: { planId, plan },
      });
    },
    [navigation],
  );

  const navigateToCreateMealPlan = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.MEAL_PLAN_STACK, {
      screen: SCREEN_NAMES.MEAL_PLAN.CREATE,
    });
  }, [navigation]);

  const navigateToEditMealPlan = useCallback(
    (planId: string, plan?: any) => {
      navigation.navigate(SCREEN_NAMES.ROOT.MEAL_PLAN_STACK, {
        screen: SCREEN_NAMES.MEAL_PLAN.EDIT,
        params: { planId, plan },
      });
    },
    [navigation],
  );

  const navigateToProfile = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.PROFILE,
    });
  }, [navigation]);

  const navigateToPreferences = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.PREFERENCES,
    });
  }, [navigation]);

  const navigateToSubscription = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.SUBSCRIPTION,
    });
  }, [navigation]);

  const navigateToDownloads = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.DOWNLOADS,
    });
  }, [navigation]);

  const navigateToSupport = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.SUPPORT,
    });
  }, [navigation]);

  const navigateToTickets = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.TICKETS,
    });
  }, [navigation]);

  const navigateToCreateTicket = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.CREATE_TICKET,
    });
  }, [navigation]);

  const navigateToTicketDetail = useCallback(
    (ticketId: string, ticket?: any) => {
      navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
        screen: SCREEN_NAMES.ACCOUNT.TICKET_DETAIL,
        params: { ticketId, ticket },
      });
    },
    [navigation],
  );

  const navigateToAbout = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.ABOUT,
    });
  }, [navigation]);

  const navigateToPrivacy = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.PRIVACY,
    });
  }, [navigation]);

  const navigateToTerms = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.ROOT.ACCOUNT_STACK, {
      screen: SCREEN_NAMES.ACCOUNT.TERMS,
    });
  }, [navigation]);

  return {
    navigateToMainTab,
    navigateToForgotPassword,
    navigateToRecipeDetail,
    navigateToMealPlanDetail,
    navigateToCreateMealPlan,
    navigateToEditMealPlan,
    navigateToProfile,
    navigateToPreferences,
    navigateToSubscription,
    navigateToDownloads,
    navigateToSupport,
    navigateToTickets,
    navigateToCreateTicket,
    navigateToTicketDetail,
    navigateToAbout,
    navigateToPrivacy,
    navigateToTerms,
  };
};

/**
 * Hook to get current route information
 */
export const useCurrentRoute = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const routeInfo = useMemo(() => {
    const state = navigation.getState();
    return {
      routeName: route.name,
      params: route.params,
      key: route.key,
      index: state?.index,
      routes: state?.routes,
      isFirstRoute: state?.index === 0,
      isLastRoute: state?.index === state?.routes?.length || 0 - 1,
    };
  }, [route, navigation]);

  return routeInfo;
};

/**
 * Hook for navigation state management
 */
export const useNavigationState = () => {
  const navigation = useNavigation();

  const getCurrentRoute = useCallback(() => {
    const state = navigation.getState();
    return state?.routes[state.index];
  }, [navigation]);

  const getAllRoutes = useCallback(() => {
    return navigation?.getState()?.routes;
  }, [navigation]);

  const getRouteHistory = useCallback(() => {
    const state = navigation.getState();
    return state?.routes.slice(0, state.index + 1);
  }, [navigation]);

  const isRouteActive = useCallback(
    (routeName: string) => {
      const currentRoute = getCurrentRoute();
      return currentRoute?.name === routeName;
    },
    [getCurrentRoute],
  );

  return {
    getCurrentRoute,
    getAllRoutes,
    getRouteHistory,
    isRouteActive,
  };
};
