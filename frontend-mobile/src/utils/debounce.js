/**
 * Utilidad de debounce para optimizar llamadas asíncronas
 * Implementa el patrón debounce para evitar múltiples llamadas consecutivas
 */

// Variable para almacenar el timeout entre llamadas
let timeoutCache = {};

/**
 * Función debounce genérica
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {Function} - Función envuelta con debounce
 */
export const debounce = (func, delay = 500) => {
  return (...args) => {
    // Obtener el nombre de la función para crear un identificador único
    const funcName = func.name || 'anonymous';
    const key = `${funcName}_${Date.now()}`;

    // Limpiar timeout anterior si existe
    if (timeoutCache[key]) {
      clearTimeout(timeoutCache[key]);
    }

    // Crear nuevo timeout
    timeoutCache[key] = setTimeout(() => {
      func.apply(this, args);
      delete timeoutCache[key];
    }, delay);
  };
};

/**
 * Hook personalizado para debounce de valores
 * Útil para validar campos mientras el usuario escribe
 * @param {any} value - Valor a debounce
 * @param {number} delay - Tiempo de espera
 * @returns {any} - Valor debounced
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Creador de validador debounced para Yup
 * Útil para validaciones asíncronas en tiempo real
 * @param {Function} validator - Función de validación que retorna Promise<boolean>
 * @param {number} delay - Tiempo de espera
 * @returns {Function} - Test function para Yup
 */
export const createDebouncedValidator = (validator, delay = 500) => {
  let timeoutId = null;

  return async (value) => {
    // Limpiar timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await validator(value);
          resolve(result);
        } catch (error) {
          resolve(false);
        }
      }, delay);
    });
  };
};

/**
 * Limpiar todos los timeouts pendientes
 * Útil cuando el componente se desmonta
 */
export const clearDebounceTimeouts = () => {
  Object.values(timeoutCache).forEach((timeoutId) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
  timeoutCache = {};
};

// Exportar como módulo por defecto la función principal
export default debounce;
