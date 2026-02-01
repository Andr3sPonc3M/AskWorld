import * as yup from 'yup';

/**
 * Esquema de validación para el formulario de registro
 * Implementa validaciones síncronas y asíncronas usando Yup
 */

// Mensajes de error centralizados para facilitar localización y consistencia
export const ERROR_MESSAGES = {
  nombre: {
    required: 'El nombre es obligatorio',
    minLength: 'El nombre debe tener al menos 2 caracteres',
    maxLength: 'El nombre no puede exceder 50 caracteres',
  },
  email: {
    required: 'El correo electrónico es obligatorio',
    invalid: 'Ingresa un correo electrónico válido',
    alreadyExists: 'Este correo ya está registrado',
    checkFailed: 'No se pudo verificar el correo',
  },
  password: {
    required: 'La contraseña es obligatoria',
    minLength: 'La contraseña debe tener al menos 8 caracteres',
    uppercase: 'Debe contener al menos una mayúscula',
    lowercase: 'Debe contener al menos una minúscula',
    number: 'Debe contener al menos un número',
    special: 'Debe contener al menos un carácter especial',
  },
  confirmPassword: {
    required: 'Confirma tu contraseña',
    mismatch: 'Las contraseñas no coinciden',
  },
  rol: {
    required: 'Selecciona un rol',
    invalid: 'Rol no válido',
  },
  general: {
    submit: 'Por favor corrige los errores antes de continuar',
  },
};

// Expresiones regulares para validaciones de complejidad
const REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
};

// Esquema principal de registro con validaciones por campo,
// validaciones cruzadas y estructura clara
const registerSchema = yup.object({
  nombre: yup
    .string()
    .required(ERROR_MESSAGES.nombre.required)
    .min(2, ERROR_MESSAGES.nombre.minLength)
    .max(50, ERROR_MESSAGES.nombre.maxLength)
    .trim()
    .matches(/^[a-zA-Z\s]+$/, 'El nombre solo puede contener letras y espacios'),

  email: yup
    .string()
    .required(ERROR_MESSAGES.email.required)
    .email(ERROR_MESSAGES.email.invalid)
    .lowercase()
    .trim(),

  password: yup
    .string()
    .required(ERROR_MESSAGES.password.required)
    .min(8, ERROR_MESSAGES.password.minLength)
    .matches(REGEX.uppercase, ERROR_MESSAGES.password.uppercase)
    .matches(REGEX.lowercase, ERROR_MESSAGES.password.lowercase)
    .matches(REGEX.number, ERROR_MESSAGES.password.number)
    .matches(REGEX.special, ERROR_MESSAGES.password.special),

  confirmPassword: yup
    .string()
    .required(ERROR_MESSAGES.confirmPassword.required)
    .oneOf([yup.ref('password')], ERROR_MESSAGES.confirmPassword.mismatch),

  rol: yup
    .string()
    .required(ERROR_MESSAGES.rol.required)
    .oneOf(['estudiante', 'profesor', 'administrador', 'usuario'], ERROR_MESSAGES.rol.invalid),
});

// Esquema para validación de login (más simple)
const loginSchema = yup.object({
  email: yup
    .string()
    .required('El correo es obligatorio')
    .email('Ingresa un correo válido'),
  password: yup
    .string()
    .required('La contraseña es obligatoria'),
});

// Función para crear esquema con validación asíncrona de email
// Permite injectar una función para verificar si el email existe
export const createRegisterSchema = (checkEmailExists) => {
  return registerSchema.shape({
    email: yup
      .string()
      .required(ERROR_MESSAGES.email.required)
      .email(ERROR_MESSAGES.email.invalid)
      .lowercase()
      .trim()
      .test(
        'email-available',
        ERROR_MESSAGES.email.alreadyExists,
        async (value) => {
          // Si no hay función de verificación o el valor está vacío, omitir
          if (!checkEmailExists || !value) {
            return true;
          }
          try {
            const isAvailable = await checkEmailExists(value);
            return isAvailable;
          } catch (error) {
            // Si falla la verificación, permitir el registro
            console.warn('Error verificando email:', error);
            return true;
          }
        }
      ),
  });
};

// Exportar esquemas por defecto
export { registerSchema, loginSchema };

// Tipos de datos que retorna el esquema validado
// Para uso con TypeScript (si se habilita en el futuro)
export const validateField = async (schema, fieldName, value) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};
