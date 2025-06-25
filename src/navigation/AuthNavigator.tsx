import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import { SCREEN_NAMES, NAVIGATION_OPTIONS } from '../constants/navigation';
import LoginScreen from '../screens/auth/LoginScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={NAVIGATION_OPTIONS.DEFAULT_SCREEN_OPTIONS}>
      <Stack.Screen name={SCREEN_NAMES.AUTH.LOGIN} component={LoginScreen} />
      {/* 
      <Stack.Screen name={SCREEN_NAMES.AUTH.SIGNUP} component={SignUpScreen} />
      <Stack.Screen name={SCREEN_NAMES.AUTH.FORGOT_PASSWORD} component={ForgotPasswordScreen} /> 
      */}
    </Stack.Navigator>
  );
};
