import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MealPlanStackParamList } from './types';
import MealPlansScreen from '../screens/main/MealPlansScreen';
import CreateMealPlanScreen from '../screens/main/CreateMealPlanScreen';
import EditMealPlanScreen from '../screens/main/EditMealPlanScreen';
import MealPlanDetailScreen from '../screens/main/MealPlanDetailScreen';

const Stack = createStackNavigator<MealPlanStackParamList>();

export const MealPlanNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="MealPlanList" component={MealPlansScreen} />
      <Stack.Screen name="CreateMealPlan" component={CreateMealPlanScreen} />
      <Stack.Screen name="EditMealPlan" component={EditMealPlanScreen} />
      <Stack.Screen name="MealPlanDetail" component={MealPlanDetailScreen} />
    </Stack.Navigator>
  );
};
