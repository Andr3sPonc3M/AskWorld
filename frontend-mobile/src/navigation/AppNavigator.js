import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Importar pantallas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';

// Crear navigators
const Stack = createNativeStackNavigator();

// Componente para pantalla de carga
const LoadingScreen = () => null;

// Componente de navegación de autenticación (público)
const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Login"
    screenOptions={{
      headerShown: false,
      animation: 'fade'
    }}
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ animation: 'fade' }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{
        animation: 'slide_from_right',
        headerShown: true,
        title: 'Crear Cuenta'
      }}
    />
  </Stack.Navigator>
);

// Componente de navegación de la aplicación (privado/protegido)
const AppStack = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#4F46E5'
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold'
      },
      animation: 'fade'
    }}
  >
    <Stack.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        headerShown: true,
        title: 'Mi Cuenta',
        headerRight: () => null // Aquí podrías agregar botón de logout
      }}
    />
  </Stack.Navigator>
);

// Componente principal del navegador
const AppNavigator = () => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {estaAutenticado ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
