import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MealPlanStackParamList } from '../types/navigation';
import { SCREEN_NAMES, NAVIGATION_OPTIONS } from '../constants/navigation';
import MealPlanListScreen from '../screens/meal-plans/MealPlanListScreen';
import MealPlanCreateScreen from '../screens/meal-plans/MealPlanCreateScreen';
import MealPlanEditScreen from '../screens/meal-plans/MealPlanEditScreen';
import MealPlanDetailScreen from '../screens/meal-plans/MealPlanDetailScreen';

const Stack = createStackNavigator<MealPlanStackParamList>();

export const MealPlanNavigator = () => {
  return (
    <Stack.Navigator screenOptions={NAVIGATION_OPTIONS.DEFAULT_SCREEN_OPTIONS}>
      <Stack.Screen name={SCREEN_NAMES.MEAL_PLAN.LIST} component={MealPlanListScreen} />
      <Stack.Screen name={SCREEN_NAMES.MEAL_PLAN.CREATE} component={MealPlanCreateScreen} />
      <Stack.Screen name={SCREEN_NAMES.MEAL_PLAN.EDIT} component={MealPlanEditScreen} />
      <Stack.Screen name={SCREEN_NAMES.MEAL_PLAN.DETAIL} component={MealPlanDetailScreen} />
    </Stack.Navigator>
  );
};