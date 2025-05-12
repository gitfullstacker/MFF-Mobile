import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAtom } from 'jotai';
import { RootStackParamList } from './types';
import { isAuthenticatedAtom } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
// import BarcodeScannerScreen from '../screens/mobile/BarcodeScannerScreen';
// import RecipePhotoCaptureScreen from '../screens/mobile/RecipePhotoCaptureScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            {/* <Stack.Screen
              name="BarcodeScanner"
              component={BarcodeScannerScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="RecipePhotoCapture"
              component={RecipePhotoCaptureScreen}
              options={{ presentation: 'modal' }}
            /> */}
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
