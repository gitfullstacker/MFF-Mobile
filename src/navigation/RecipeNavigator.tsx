import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RecipeStackParamList } from './types';
import RecipesScreen from '../screens/main/RecipesScreen';
import RecipeDetailScreen from '../screens/main/RecipeDetailScreen';

const Stack = createStackNavigator<RecipeStackParamList>();

export const RecipeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="RecipeList" component={RecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
};
