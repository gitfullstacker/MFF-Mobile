import { NavigatorScreenParams } from '@react-navigation/native';
import { Recipe } from '../types/recipe';
import { Ticket } from '../types/ticket';
import { Plan } from '@/types/plan';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Recipes: undefined;
  'Meal Plans': undefined;
  Favorites: undefined;
  Account: undefined;
};

export type RecipeStackParamList = {
  RecipeList: undefined;
  RecipeDetail: { recipeId: string };
};

export type MealPlanStackParamList = {
  MealPlanList: undefined;
  CreateMealPlan: undefined;
  EditMealPlan: { planId: string };
  MealPlanDetail: { planId: string };
};

export type AccountStackParamList = {
  AccountMain: undefined;
  Profile: undefined;
  Preferences: undefined;
  Subscription: undefined;
  Downloads: undefined;
  Support: undefined;
  Tickets: undefined;
  CreateTicket: undefined;
  TicketDetail: { ticketId: string; ticket?: Ticket };
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
