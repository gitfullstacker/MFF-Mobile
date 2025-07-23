import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { NAVIGATION_OPTIONS, SCREEN_NAMES } from '../constants/navigation';
import { TabBar } from '../components/navigation/TabBar';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import RecipeListScreen from '../screens/recipes/RecipeListScreen';
import MealPlanListScreen from '../screens/meal-plans/MealPlanListScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import AccountScreen from '../screens/account/AccountScreen';
import { View } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={props => <TabBar {...props} />}
        screenOptions={NAVIGATION_OPTIONS.DEFAULT_SCREEN_OPTIONS}>
        <Tab.Screen
          name={SCREEN_NAMES.MAIN_TAB.DASHBOARD}
          component={DashboardScreen}
          options={{ tabBarLabel: 'Dashboard' }}
        />
        <Tab.Screen
          name={SCREEN_NAMES.MAIN_TAB.RECIPES}
          component={RecipeListScreen}
          options={{ tabBarLabel: 'Recipes' }}
        />
        <Tab.Screen
          name={SCREEN_NAMES.MAIN_TAB.MEAL_PLANS}
          component={MealPlanListScreen}
          options={{ tabBarLabel: 'Meal Plans' }}
        />
        <Tab.Screen
          name={SCREEN_NAMES.MAIN_TAB.FAVORITES}
          component={FavoritesScreen}
          options={{ tabBarLabel: 'Favorites' }}
        />
        <Tab.Screen
          name={SCREEN_NAMES.MAIN_TAB.ACCOUNT}
          component={AccountScreen}
          options={{ tabBarLabel: 'Account' }}
        />
      </Tab.Navigator>
    </View>
  );
};
