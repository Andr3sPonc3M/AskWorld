import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/api';

// Crear el contexto de autenticación
const AuthContext = createContext(null);

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Verificar sesión al iniciar la aplicación
  useEffect(() => {
    inicializarAuth();
  }, []);

  // Inicializar autenticación desde AsyncStorage
  const inicializarAuth = async () => {
    try {
      setCargando(true);
      
      const tokenGuardado = await AsyncStorage.getItem('userToken');
      const usuarioGuardado = await AsyncStorage.getItem('userData');

      if (tokenGuardado && usuarioGuardado) {
        // Verificar que el token aún es válido con el servidor
        try {
          const respuesta = await authAPI.verificarToken();
          if (respuesta.success) {
            setToken(tokenGuardado);
            setUsuario(JSON.parse(usuarioGuardado));
          } else {
            // Token inválido, limpiar storage
            await logout();
          }
        } catch (error) {
          console.log('Token no válido, cerrando sesión');
          await logout();
        }
      }
    } catch (error) {
      console.error('Error inicializando auth:', error);
    } finally {
      setCargando(false);
    }
  };

  // Función de registro
  const registro = async (datosRegistro) => {
    try {
      setError(null);
      setCargando(true);

      const respuesta = await authAPI.registro(datosRegistro);

      if (respuesta.success) {
        // Guardar token y datos del usuario
        await AsyncStorage.setItem('userToken', respuesta.token);
        await AsyncStorage.setItem('userData', JSON.stringify(respuesta.usuario));

        setToken(respuesta.token);
        setUsuario(respuesta.usuario);

        return { success: true };
      } else {
        setError(respuesta.message);
        return { success: false, message: respuesta.message };
      }
    } catch (error) {
      const mensajeError = error.message || 'Error en el registro';
      setError(mensajeError);
      return { success: false, message: mensajeError };
    } finally {
      setCargando(false);
    }
  };

  // Función de login
  const login = async (email, password) => {
    try {
      setError(null);
      setCargando(true);

      const respuesta = await authAPI.login(email, password);

      if (respuesta.success) {
        // Guardar token y datos del usuario
        await AsyncStorage.setItem('userToken', respuesta.token);
        await AsyncStorage.setItem('userData', JSON.stringify(respuesta.usuario));

        setToken(respuesta.token);
        setUsuario(respuesta.usuario);

        return { success: true };
      } else {
        setError(respuesta.message);
        return { success: false, message: respuesta.message };
      }
    } catch (error) {
      const mensajeError = error.message || 'Error en el inicio de sesión';
      setError(mensajeError);
      return { success: false, message: mensajeError };
    } finally {
      setCargando(false);
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      setCargando(true);
      
      // Intentar cerrar sesión en el servidor (opcional)
      try {
        await authAPI.logout();
      } catch (error) {
        // Si falla el logout del servidor, continuamos igual
        console.log('Logout del servidor falló:', error);
      }

      // Limpiar storage local
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');

      setToken(null);
      setUsuario(null);
      setError(null);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setCargando(false);
    }
  };

  // Limpiar error
  const limpiarError = () => {
    setError(null);
  };

  // Valor del contexto
  const valor = {
    usuario,
    token,
    cargando,
    error,
    registro,
    login,
    logout,
    limpiarError,
    estaAutenticado: !!token
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const contexto = useContext(AuthContext);
  
  if (!contexto) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return contexto;
};

export default AuthContext;
