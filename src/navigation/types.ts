import { NavigatorScreenParams } from '@react-navigation/native';
import { Recipe } from '../types/recipe';
import { MealPlan } from '../types/plan';
import { Ticket } from '../types/ticket';

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
  RecipeDetail: { recipeId: string; recipe?: Recipe };
};

export type MealPlanStackParamList = {
  MealPlanList: undefined;
  CreateMealPlan: undefined;
  EditMealPlan: { planId: string; plan?: MealPlan };
  MealPlanDetail: { planId: string; plan?: MealPlan };
};

export type AccountStackParamList = {
  AccountMain: undefined;
  Profile: undefined;
  Preferences: undefined;
  Subscription: undefined;
  Support: undefined;
  Tickets: undefined;
  CreateTicket: undefined;
  TicketDetail: { ticketId: string; ticket?: Ticket };
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
