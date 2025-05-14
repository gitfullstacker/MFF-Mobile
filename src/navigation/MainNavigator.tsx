import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { TabBar } from '../components/navigation/TabBar';
import DashboardScreen from '../screens/main/DashboardScreen';
import RecipesScreen from '../screens/main/RecipesScreen';
import MealPlansScreen from '../screens/main/MealPlansScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import AccountScreen from '../screens/main/AccountScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Recipes" component={RecipesScreen} />
      <Tab.Screen name="Meal Plans" component={MealPlansScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};
