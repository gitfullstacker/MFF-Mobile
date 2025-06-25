import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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

export const AppNavigator = () => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  return (
    <NavigationContainer>
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