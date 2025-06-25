import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAtom } from 'jotai';
import { RootStackParamList } from '../types/navigation';
import { SCREEN_NAMES, NAVIGATION_OPTIONS } from '../constants/navigation';
import { isAuthenticatedAtom } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { RecipeNavigator } from './RecipeNavigator';
import { MealPlanNavigator } from './MealPlanNavigator';
import { AccountNavigator } from './AccountNavigator';

const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ navigationRef }) => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  const linking = {
    prefixes: ['mealapp://', 'https://macrofriendlyfood.com', 'https://yourdomain.com'],
    config: {
      screens: {
        [SCREEN_NAMES.ROOT.AUTH]: {
          screens: {
            [SCREEN_NAMES.AUTH.LOGIN]: 'login',
            [SCREEN_NAMES.AUTH.FORGOT_PASSWORD]: 'forgot-password',
            [SCREEN_NAMES.AUTH.RESET_PASSWORD]: 'reset-password',
          },
        },
        [SCREEN_NAMES.ROOT.MAIN]: {
          screens: {
            [SCREEN_NAMES.MAIN_TAB.DASHBOARD]: 'dashboard',
            [SCREEN_NAMES.MAIN_TAB.RECIPES]: 'recipes',
            [SCREEN_NAMES.MAIN_TAB.MEAL_PLANS]: 'meal-plans',
            [SCREEN_NAMES.MAIN_TAB.FAVORITES]: 'favorites',
            [SCREEN_NAMES.MAIN_TAB.ACCOUNT]: 'account',
          },
        },
        [SCREEN_NAMES.ROOT.RECIPE_STACK]: {
          screens: {
            [SCREEN_NAMES.RECIPE.LIST]: 'recipes',
            [SCREEN_NAMES.RECIPE.DETAIL]: 'recipe/:recipeId',
          },
        },
        [SCREEN_NAMES.ROOT.MEAL_PLAN_STACK]: {
          screens: {
            [SCREEN_NAMES.MEAL_PLAN.LIST]: 'meal-plans',
            [SCREEN_NAMES.MEAL_PLAN.DETAIL]: 'meal-plan/:planId',
            [SCREEN_NAMES.MEAL_PLAN.CREATE]: 'meal-plans/create',
            [SCREEN_NAMES.MEAL_PLAN.EDIT]: 'meal-plan/:planId/edit',
          },
        },
      },
    },
  };

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator screenOptions={NAVIGATION_OPTIONS.DEFAULT_SCREEN_OPTIONS}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name={SCREEN_NAMES.ROOT.MAIN} component={MainNavigator} />
            <Stack.Screen name={SCREEN_NAMES.ROOT.MEAL_PLAN_STACK} component={MealPlanNavigator} />
            <Stack.Screen name={SCREEN_NAMES.ROOT.RECIPE_STACK} component={RecipeNavigator} />
            <Stack.Screen name={SCREEN_NAMES.ROOT.ACCOUNT_STACK} component={AccountNavigator} />
          </>
        ) : (
          <Stack.Screen name={SCREEN_NAMES.ROOT.AUTH} component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};