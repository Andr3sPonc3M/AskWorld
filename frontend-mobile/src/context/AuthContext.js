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
  const [haVistoOnboarding, setHaVistoOnboarding] = useState(false);

  // Verificar sesión y estado de onboarding al iniciar la aplicación
  useEffect(() => {
    inicializarAuth();
    verificarOnboarding();
  }, []);

  // Verificar si el usuario ya vio el onboarding
  const verificarOnboarding = async () => {
    try {
      const visto = await AsyncStorage.getItem('hasSeenOnboarding');
      setHaVistoOnboarding(visto === 'true');
    } catch (error) {
      console.error('Error verificando onboarding:', error);
      setHaVistoOnboarding(false);
    }
  };

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

  // Marcar onboarding como visto
  const marcarOnboardingVisto = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHaVistoOnboarding(true);
    } catch (error) {
      console.error('Error guardando estado de onboarding:', error);
    }
  };

  // Función para verificar si un email ya existe (para validación asíncrona)
  const verificarEmailExistente = async (email) => {
    try {
      // Simular verificación consultando al backend
      // En una implementación real, endpoint para verificar email sin registrar
      // Por ahora, verificamos si hay error de email duplicado al intentar registrar

      // Nota: Esta es una simulación. En producción, habría un endpoint
      // GET /api/auth/check-email?email=correo@test.com
      // que retorne { disponible: true/false }

      // Simulamos una verificación local basada en la API existente
      // Hacemos un intento de registro para ver si el email existe
      const respuesta = await authAPI.registro({
        nombre: 'VERIFICACION_TEMPORAL',
        email: email,
        password: 'Temporal123!',
        rol: 'usuario',
      });

      // Si el registro falla con error de email existente
      if (!respuesta.success && respuesta.message.includes('email')) {
        return false; // Email no disponible
      }

      // Si el registro es exitoso (email no existe)
      return true; // Email disponible
    } catch (error) {
      // Si hay error de red, asumimos que el email podría existir
      console.warn('Error verificando email:', error);
      return true; // En caso de error, permitimos continuar (el servidor validará después)
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
    haVistoOnboarding,
    registro,
    login,
    logout,
    limpiarError,
    verificarEmailExistente,
    marcarOnboardingVisto,
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
