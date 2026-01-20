import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RecipeStackParamList } from '../types/navigation';
import { SCREEN_NAMES, NAVIGATION_OPTIONS } from '../constants/navigation';
import RecipeListScreen from '../screens/recipes/RecipeListScreen';
import RecipeDetailScreen from '../screens/recipes/RecipeDetailScreen';

const Stack = createStackNavigator<RecipeStackParamList>();

export const RecipeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={NAVIGATION_OPTIONS.DEFAULT_SCREEN_OPTIONS}>
      <Stack.Screen name={SCREEN_NAMES.RECIPE.LIST} component={RecipeListScreen} />
      <Stack.Screen name={SCREEN_NAMES.RECIPE.DETAIL} component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
};