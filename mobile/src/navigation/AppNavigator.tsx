import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import HeaderNavigation from '../components/HeaderNavigation';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CreateBarbershopScreen from '../screens/CreateBarbershopScreen';
import CreateServicesScreen from '../screens/CreateServicesScreen';
import CreateEmployeesScreen from '../screens/CreateEmployeesScreen';
import CreateScheduleScreen from '../screens/CreateScheduleScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ConfigScreen from '../screens/ConfigScreen';
import ManageServicesScreen from '../screens/ManageServicesScreen';
import ManageEmployeesScreen from '../screens/ManageEmployeesScreen';
import EditBarbershopScreen from '../screens/EditBarbershopScreen';
import EditServiceScreen from '../screens/EditServiceScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const needsOnboarding = useSelector((state: RootState) => state.auth.needsOnboarding);

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
        ) : needsOnboarding ? (
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ 
                title: 'Bem-vindo',
                headerLeft: () => null,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="CreateBarbershop" 
              component={CreateBarbershopScreen}
              options={{ 
                title: 'Criar Barbearia',
                headerLeft: () => null,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="CreateServices" 
              component={CreateServicesScreen}
              options={{ 
                title: 'Adicionar Serviços',
                headerLeft: () => null,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="CreateEmployees" 
              component={CreateEmployeesScreen}
              options={{ 
                title: 'Adicionar Funcionários',
                headerLeft: () => null,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="CreateSchedule" 
              component={CreateScheduleScreen}
              options={{ 
                title: 'Configurar Horários',
                headerLeft: () => null,
                gestureEnabled: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Appointments" 
              component={AppointmentsScreen}
              options={({ navigation }) => ({
                title: 'Agendamentos',
                headerRight: () => <HeaderNavigation navigation={navigation} currentScreen="Appointments" />
              })}
            />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={({ navigation }) => ({
                title: 'Dashboard',
                headerRight: () => <HeaderNavigation navigation={navigation} currentScreen="Dashboard" />
              })}
            />
            <Stack.Screen 
              name="Config" 
              component={ConfigScreen}
              options={({ navigation }) => ({
                title: 'Configurações',
                headerRight: () => <HeaderNavigation navigation={navigation} currentScreen="Config" />
              })}
            />
            <Stack.Screen 
              name="ManageServices" 
              component={ManageServicesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ManageEmployees" 
              component={ManageEmployeesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="EditBarbershop" 
              component={EditBarbershopScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CreateServices" 
              component={CreateServicesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="EditService" 
              component={EditServiceScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CreateEmployees" 
              component={CreateEmployeesScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
