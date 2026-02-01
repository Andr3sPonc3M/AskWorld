import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:5000/api';

// Crear instancia de Axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de Request: Agregar token automáticamente
api.interceptors.request.use(
  async (config) => {
    // En React Native, usamos AsyncStorage para persistir el token
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error leyendo token del storage:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response: Manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo de errores comunes
    if (error.response) {
      // Error del servidor (4xx, 5xx)
      const { status, data } = error.response;
      
      if (status === 401) {
        // Token expirado o inválido
        console.log('Token expirado o inválido');
        // Aquí podrías dispatchear una acción para logout automático
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Error de red
      console.error('Error de red:', error.message);
      return Promise.reject({ message: 'Error de conexión. Verifica tu internet.' });
    }
    
    return Promise.reject({ message: error.message });
  }
);

// Funciones de la API para autenticación
export const authAPI = {
  // Registrar nuevo usuario
  registro: async (datos) => {
    const response = await api.post('/auth/register', datos);
    return response.data;
  },
  
  // Iniciar sesión
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  // Obtener perfil del usuario actual
  obtenerPerfil: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  // Verificar token
  verificarToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
  
  // Cerrar sesión
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export default api;
