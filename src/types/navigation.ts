import { NavigatorScreenParams } from '@react-navigation/native';
import { Recipe } from './recipe';
import { Ticket } from './ticket';
import { Plan } from './plan';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: {
    token: string;
  };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Recipes: undefined;
  MealPlans: undefined;
  Favorites: undefined;
  Account: undefined;
};

export type RecipeStackParamList = {
  RecipeList: undefined;
  RecipeDetail: {
    recipeId: string;
    recipe?: Recipe;
  };
};

export type MealPlanStackParamList = {
  MealPlanList: undefined;
  CreateMealPlan: undefined;
  EditMealPlan: {
    planId: string;
    plan?: Plan;
  };
  MealPlanDetail: {
    planId: string;
    plan?: Plan;
  };
};

export type AccountStackParamList = {
  AccountMain: undefined;
  Profile: undefined;
  Preferences: undefined;
  Downloads: undefined;
  Support: undefined;
  Tickets: undefined;
  CreateTicket: undefined;
  TicketDetail: {
    ticketId: string;
    ticket?: Ticket;
  };
  About: undefined;
  Privacy: undefined;
  Terms: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  RecipeStack: NavigatorScreenParams<RecipeStackParamList>;
  MealPlanStack: NavigatorScreenParams<MealPlanStackParamList>;
  AccountStack: NavigatorScreenParams<AccountStackParamList>;
  BarcodeScanner: undefined;
  RecipePhotoCapture: undefined;
};

// Navigation Props Types for better type safety
export type AuthNavigationProp =
  import('@react-navigation/stack').StackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp =
  import('@react-navigation/bottom-tabs').BottomTabNavigationProp<MainTabParamList>;
export type RecipeNavigationProp =
  import('@react-navigation/stack').StackNavigationProp<RecipeStackParamList>;
export type MealPlanNavigationProp =
  import('@react-navigation/stack').StackNavigationProp<MealPlanStackParamList>;
export type AccountNavigationProp =
  import('@react-navigation/stack').StackNavigationProp<AccountStackParamList>;
export type RootNavigationProp =
  import('@react-navigation/stack').StackNavigationProp<RootStackParamList>;

// Composite Navigation Types
export type CompositeAuthNavigationProp =
  import('@react-navigation/native').CompositeNavigationProp<
    AuthNavigationProp,
    RootNavigationProp
  >;

export type CompositeMainTabNavigationProp<T extends keyof MainTabParamList> =
  import('@react-navigation/native').CompositeNavigationProp<
    import('@react-navigation/bottom-tabs').BottomTabNavigationProp<
      MainTabParamList,
      T
    >,
    RootNavigationProp
  >;

export type CompositeRecipeNavigationProp =
  import('@react-navigation/native').CompositeNavigationProp<
    RecipeNavigationProp,
    RootNavigationProp
  >;

export type CompositeMealPlanNavigationProp =
  import('@react-navigation/native').CompositeNavigationProp<
    MealPlanNavigationProp,
    RootNavigationProp
  >;

export type CompositeAccountNavigationProp =
  import('@react-navigation/native').CompositeNavigationProp<
    AccountNavigationProp,
    RootNavigationProp
  >;

// Route Props Types
export type AuthRouteProp<T extends keyof AuthStackParamList> =
  import('@react-navigation/native').RouteProp<AuthStackParamList, T>;
export type MainTabRouteProp<T extends keyof MainTabParamList> =
  import('@react-navigation/native').RouteProp<MainTabParamList, T>;
export type RecipeRouteProp<T extends keyof RecipeStackParamList> =
  import('@react-navigation/native').RouteProp<RecipeStackParamList, T>;
export type MealPlanRouteProp<T extends keyof MealPlanStackParamList> =
  import('@react-navigation/native').RouteProp<MealPlanStackParamList, T>;
export type AccountRouteProp<T extends keyof AccountStackParamList> =
  import('@react-navigation/native').RouteProp<AccountStackParamList, T>;
export type RootRouteProp<T extends keyof RootStackParamList> =
  import('@react-navigation/native').RouteProp<RootStackParamList, T>;
