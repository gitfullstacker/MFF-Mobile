/**
 * Navigation Screen Names
 * Centralized constants for all navigation screen names
 */

export const SCREEN_NAMES = {
  // Auth Stack
  AUTH: {
    LOGIN: 'Login',
    SIGNUP: 'SignUp',
    FORGOT_PASSWORD: 'ForgotPassword',
    RESET_PASSWORD: 'ResetPassword',
  },

  // Main Tab
  MAIN_TAB: {
    DASHBOARD: 'Dashboard',
    RECIPES: 'Recipes',
    MEAL_PLANS: 'MealPlans',
    FAVORITES: 'Favorites',
    ACCOUNT: 'Account',
  },

  // Recipe Stack
  RECIPE: {
    LIST: 'RecipeList',
    DETAIL: 'RecipeDetail',
  },

  // Meal Plan Stack
  MEAL_PLAN: {
    LIST: 'MealPlanList',
    CREATE: 'CreateMealPlan',
    EDIT: 'EditMealPlan',
    DETAIL: 'MealPlanDetail',
  },

  // Account Stack
  ACCOUNT: {
    MAIN: 'AccountMain',
    PROFILE: 'Profile',
    PREFERENCES: 'Preferences',
    DOWNLOADS: 'Downloads',
    TICKETS: 'Tickets',
    CREATE_TICKET: 'CreateTicket',
    TICKET_DETAIL: 'TicketDetail',
    ABOUT: 'About',
    PRIVACY: 'Privacy',
    TERMS: 'Terms',
  },

  // Root Stack
  ROOT: {
    AUTH: 'Auth',
    MAIN: 'Main',
    RECIPE_STACK: 'RecipeStack',
    MEAL_PLAN_STACK: 'MealPlanStack',
    ACCOUNT_STACK: 'AccountStack',
    BARCODE_SCANNER: 'BarcodeScanner',
    RECIPE_PHOTO_CAPTURE: 'RecipePhotoCapture',
  },
} as const;

/**
 * Navigation Options
 */
export const NAVIGATION_OPTIONS = {
  // Default screen options
  DEFAULT_SCREEN_OPTIONS: {
    headerShown: false,
  },

  // Modal presentation options
  MODAL_OPTIONS: {
    presentation: 'modal' as const,
    cardStyle: { backgroundColor: 'transparent' },
    cardOverlayEnabled: true,
  },

  // Full screen modal options
  FULL_SCREEN_MODAL_OPTIONS: {
    presentation: 'fullScreenModal' as const,
  },

  // Card presentation options
  CARD_OPTIONS: {
    presentation: 'card' as const,
  },

  // Animation options
  ANIMATIONS: {
    SLIDE_FROM_RIGHT: {
      cardStyleInterpolator: ({ current, layouts }: any) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        };
      },
    },
    FADE: {
      cardStyleInterpolator: ({ current }: any) => {
        return {
          cardStyle: {
            opacity: current.progress,
          },
        };
      },
    },
  },
} as const;

/**
 * Tab Bar Configuration
 */
export const TAB_BAR_CONFIG = {
  ICONS: {
    [SCREEN_NAMES.MAIN_TAB.DASHBOARD]: 'home',
    [SCREEN_NAMES.MAIN_TAB.RECIPES]: 'book',
    [SCREEN_NAMES.MAIN_TAB.MEAL_PLANS]: 'calendar',
    [SCREEN_NAMES.MAIN_TAB.FAVORITES]: 'heart',
    [SCREEN_NAMES.MAIN_TAB.ACCOUNT]: 'user',
  },
} as const;

/**
 * Navigation Timing Constants
 */
export const NAVIGATION_TIMING = {
  // Debounce time for preventing rapid navigation
  DEBOUNCE_TIME: 300,

  // Animation durations
  TRANSITION_DURATION: 250,
  MODAL_ANIMATION_DURATION: 300,

  // Timeout for navigation completion
  NAVIGATION_TIMEOUT: 5000,
} as const;

/**
 * Deep Link Prefixes
 */
export const DEEP_LINK_CONFIG = {
  PREFIX: 'macrofriendlyfood://',
  PREFIXES: ['macrofriendlyfood://'],

  // URL patterns
  PATTERNS: {
    RECIPE_DETAIL: '/recipe/:recipeId',
    MEAL_PLAN_DETAIL: '/meal-plan/:planId',
    ACCOUNT_PROFILE: '/profile',
    AUTH_LOGIN: '/login',
    AUTH_RESET_PASSWORD: '/reset-password/:token',
  },
} as const;

/**
 * Navigation State Keys
 */
export const NAVIGATION_STATE_KEYS = {
  IS_READY: 'navigationReady',
  CURRENT_ROUTE: 'currentRoute',
  PREVIOUS_ROUTE: 'previousRoute',
  NAVIGATION_HISTORY: 'navigationHistory',
} as const;

/**
 * Error Messages
 */
export const NAVIGATION_ERRORS = {
  NAVIGATION_NOT_READY: 'Navigation is not ready',
  INVALID_ROUTE: 'Invalid route provided',
  NAVIGATION_TIMEOUT: 'Navigation timeout exceeded',
  DEEP_LINK_ERROR: 'Failed to handle deep link',
} as const;
