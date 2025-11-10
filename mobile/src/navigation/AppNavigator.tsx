import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ConfigScreen from '../screens/ConfigScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Appointments" 
              component={AppointmentsScreen}
              options={{ title: 'Agendamentos' }}
            />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ title: 'Dashboard' }}
            />
            <Stack.Screen 
              name="Config" 
              component={ConfigScreen}
              options={{ title: 'Configurações' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
