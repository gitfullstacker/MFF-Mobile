import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { TabBar } from '../components/navigation/TabBar';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import RecipeListScreen from '../screens/recipes/RecipeListScreen';
import MealPlanListScreen from '../screens/meal-plans/MealPlanListScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import AccountScreen from '../screens/account/AccountScreen';
import { View } from 'react-native';
import ThriveDeskFAB from '@/components/support/ThriveDeskFAB';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={props => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Recipes" component={RecipeListScreen} />
        <Tab.Screen name="Meal Plans" component={MealPlanListScreen} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>

      {/* Global ThriveDesk FAB */}
      <ThriveDeskFAB visible={true} position="bottom-right" showLabel={false} />
    </View>
  );
};
