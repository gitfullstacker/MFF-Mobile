import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MealPlanStackParamList } from './types';
import MealPlanListScreen from '../screens/meal-plans/MealPlanListScreen';
import MealPlanCreateScreen from '../screens/meal-plans/MealPlanCreateScreen';
import MealPlanEditScreen from '../screens/meal-plans/MealPlanEditScreen';
import MealPlanDetailScreen from '../screens/meal-plans/MealPlanDetailScreen';

const Stack = createStackNavigator<MealPlanStackParamList>();

export const MealPlanNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="MealPlanList" component={MealPlanListScreen} />
      <Stack.Screen name="CreateMealPlan" component={MealPlanCreateScreen} />
      <Stack.Screen name="EditMealPlan" component={MealPlanEditScreen} />
      <Stack.Screen name="MealPlanDetail" component={MealPlanDetailScreen} />
    </Stack.Navigator>
  );
};
