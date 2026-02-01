import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import debounce from '../utils/debounce';

const ROLES_DISPONIBLES = [
  { label: 'Estudiante', value: 'estudiante' },
  { label: 'Profesor', value: 'profesor' },
  { label: 'Administrador', value: 'administrador' },
  { label: 'Usuario', value: 'usuario' },
];

// Mensajes de error accesibles con iconos
const ERROR_MESSAGES = {
  nombre: {
    required: '⚠️ El nombre es obligatorio',
    minLength: '⚠️ El nombre debe tener al menos 2 caracteres',
    maxLength: '⚠️ El nombre no puede exceder 50 caracteres',
    invalid: '⚠️ El nombre solo puede contener letras',
  },
  email: {
    required: '⚠️ El correo electrónico es obligatorio',
    invalid: '⚠️ Ingresa un correo electrónico válido',
    alreadyExists: '⚠️ Este correo ya está registrado',
  },
  password: {
    required: '⚠️ La contraseña es obligatoria',
    minLength: '⚠️ Mínimo 8 caracteres',
    uppercase: '⚠️ Debe tener al menos una mayúscula',
    lowercase: '⚠️ Debe tener al menos una minúscula',
    number: '⚠️ Debe tener al menos un número',
    special: '⚠️ Debe tener un carácter especial',
  },
  confirmPassword: {
    required: '⚠️ Confirma tu contraseña',
    mismatch: '⚠️ Las contraseñas no coinciden',
  },
};

// Esquema de validación con Yup
const registerSchema = yup.object({
  nombre: yup
    .string()
    .required(ERROR_MESSAGES.nombre.required)
    .min(2, ERROR_MESSAGES.nombre.minLength)
    .max(50, ERROR_MESSAGES.nombre.maxLength)
    .matches(/^[a-zA-Z\s]+$/, ERROR_MESSAGES.nombre.invalid),
  email: yup
    .string()
    .required(ERROR_MESSAGES.email.required)
    .email(ERROR_MESSAGES.email.invalid),
  password: yup
    .string()
    .required(ERROR_MESSAGES.password.required)
    .min(8, ERROR_MESSAGES.password.minLength)
    .matches(/[A-Z]/, ERROR_MESSAGES.password.uppercase)
    .matches(/[a-z]/, ERROR_MESSAGES.password.lowercase)
    .matches(/[0-9]/, ERROR_MESSAGES.password.number)
    .matches(/[!@#$%^&*(),.?":{}|<>]/, ERROR_MESSAGES.password.special),
  confirmPassword: yup
    .string()
    .required(ERROR_MESSAGES.confirmPassword.required)
    .oneOf([yup.ref('password')], ERROR_MESSAGES.confirmPassword.mismatch),
});

// Componente de campo de entrada con accesibilidad
const AccessibleInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  secureTextEntry,
  returnKeyType,
  onSubmitEditing,
  inputRef,
  accessibilityLabel,
  accessibilityHint,
  icon,
}) => {
  const hasError = Boolean(error);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label} accessibilityLabel={accessibilityLabel}>
        {label}
      </Text>
      <View style={[styles.inputWrapper, hasError ? styles.inputWrapperError : null]}>
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <TextInput
          ref={inputRef}
          style={[styles.input, hasError ? styles.inputError : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={false}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ invalid: hasError }}
        />
      </View>
      {hasError && (
        <View style={styles.errorContainer}>
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

// Indicador de requisitos de contraseña
const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Una mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Una minúscula', met: /[a-z]/.test(password) },
    { label: 'Un número', met: /[0-9]/.test(password) },
    { label: 'Un carácter especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  return (
    <View style={styles.requirementsContainer}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementItem}>
          <Text style={[styles.requirementIcon, req.met ? styles.requirementMet : null]}>
            {req.met ? '✓' : '○'}
          </Text>
          <Text
            style={[
              styles.requirementText,
              req.met ? styles.requirementTextMet : null,
            ]}
          >
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const RegisterScreen = ({ navigation }) => {
  const { registro, cargando, limpiarError, verificarEmailExistente } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'usuario',
  });
  const [errores, setErrores] = useState({});
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarRoles, setMostrarRoles] = useState(false);
  const [validandoEmail, setValidandoEmail] = useState(false);
  const [emailDisponible, setEmailDisponible] = useState(true);

  // Referencias para manejar el foco
  const nombreRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Campos que han sido tocados (para validación en tiempo real)
  const [camposTocados, setCamposTocados] = useState({});

  // Función debounced para validar email asincrónicamente
  const validarEmailAsincrono = useCallback(
    debounce(async (email) => {
      if (!email || !yup.string().email().isValidSync(email)) {
        setEmailDisponible(true);
        return;
      }

      setValidandoEmail(true);
      try {
        const disponible = await verificarEmailExistente(email);
        setEmailDisponible(disponible);
        if (!disponible) {
          setErrores((prev) => ({
            ...prev,
            email: ERROR_MESSAGES.email.alreadyExists,
          }));
        } else if (camposTocados.email) {
          // Limpiar error si el email ahora está disponible
          setErrores((prev) => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      } catch (error) {
        console.warn('Error verificando email:', error);
      } finally {
        setValidandoEmail(false);
      }
    }, 500),
    []
  );

  // Actualizar datos del formulario
  const actualizarCampo = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    setCamposTocados((prev) => ({ ...prev, [campo]: true }));

    // Validación en tiempo real para campos táctiles
    if (camposTocados[campo]) {
      validarCampoIndividual(campo, valor);
    }

    // Validación asíncrona para email
    if (campo === 'email') {
      validarEmailAsincrono(valor);
    }
  };

  // Validar un campo individual
  const validarCampoIndividual = async (campo, valor) => {
    try {
      await registerSchema.validateAt(campo, formData);
      setErrores((prev) => {
        const newErrors = { ...prev };
        delete newErrors[campo];
        return newErrors;
      });
    } catch (error) {
      setErrores((prev) => ({
        ...prev,
        [campo]: error.message,
      }));
    }
  };

  // Validar todo el formulario
  const validarFormulario = async () => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      return { valido: true, errores: {} };
    } catch (validationErrors) {
      const erroresObj = {};
      const primerError = validationErrors.inner[0];

      validationErrors.inner.forEach((error) => {
        erroresObj[error.path] = error.message;
      });

      // Mover foco al primer campo con error
      if (primerError) {
        moverFocoAlError(primerError.path);
      }

      // Anunciar error globalmente para accesibilidad
      AccessibilityInfo.announceForAccessibility(
        'Hay errores en el formulario. Por favor revisa los campos marcados.'
      );

      return { valido: false, errores: erroresObj };
    }
  };

  // Mover foco al campo con error
  const moverFocoAlError = (campo) => {
    const refs = {
      nombre: nombreRef,
      email: emailRef,
      password: passwordRef,
      confirmPassword: confirmPasswordRef,
    };

    if (refs[campo]?.current) {
      refs[campo].current.focus();
    }
  };

  // Manejar envío del formulario
  const handleRegister = async () => {
    setCamposTocados({
      nombre: true,
      email: true,
      password: true,
      confirmPassword: true,
      rol: true,
    });

    const resultado = await validarFormulario();

    if (!resultado.valido) {
      setErrores(resultado.errores);
      return;
    }

    // Verificar que el email esté disponible antes de registrar
    if (!emailDisponible) {
      Alert.alert('Error', ERROR_MESSAGES.email.alreadyExists);
      return;
    }

    const respuesta = await registro({
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      rol: formData.rol,
    });

    if (!respuesta.success) {
      Alert.alert(
        'Error',
        respuesta.message || 'No se pudo completar el registro'
      );
    }
  };

  // Manejar navegación entre campos con la tecla "siguiente"
  const handleNextField = (currentField) => {
    const fields = ['nombre', 'email', 'password', 'confirmPassword'];
    const currentIndex = fields.indexOf(currentField);
    const nextField = fields[currentIndex + 1];

    if (nextField) {
      const refs = {
        nombre: nombreRef,
        email: emailRef,
        password: passwordRef,
        confirmPassword: confirmPasswordRef,
      };

      if (refs[nextField]?.current) {
        refs[nextField].current.focus();
      }
    }
  };

  // Limpiar errores al desmontar
  useEffect(() => {
    return () => limpiarError();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel="Formulario de registro"
      >
        <Text style={styles.title} accessibilityRole="header">
          Crear Cuenta
        </Text>
        <Text style={styles.subtitle}>
          Regístrate para comenzar tu experiencia segura
        </Text>

        <View style={styles.form}>
          {/* Campo de nombre */}
          <AccessibleInput
            label="Nombre completo *"
            value={formData.nombre}
            onChangeText={(valor) => actualizarCampo('nombre', valor)}
            placeholder="Tu nombre completo"
            error={errores.nombre}
            inputRef={nombreRef}
            returnKeyType="next"
            onSubmitEditing={() => handleNextField('nombre')}
            accessibilityLabel="Nombre completo"
            accessibilityHint="Ingresa tu nombre completo, solo letras"
          />

          {/* Campo de email con validación asíncrona */}
          <AccessibleInput
            label="Correo electrónico *"
            value={formData.email}
            onChangeText={(valor) => actualizarCampo('email', valor)}
            placeholder="tu@email.com"
            error={errores.email}
            keyboardType="email-address"
            inputRef={emailRef}
            returnKeyType="next"
            onSubmitEditing={() => handleNextField('email')}
            accessibilityLabel="Correo electrónico"
            accessibilityHint="Ingresa tu correo electrónico"
            icon={validandoEmail ? '⏳' : emailDisponible ? '✓' : '✗'}
          />

          {/* Selector de rol */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Rol *</Text>
            <TouchableOpacity
              style={[styles.input, styles.roleInput]}
              onPress={() => setMostrarRoles(!mostrarRoles)}
              accessibilityLabel="Seleccionar rol"
              accessibilityHint="Toca para ver las opciones de rol"
              accessibilityRole="button"
            >
              <Text style={styles.roleText}>
                {ROLES_DISPONIBLES.find((r) => r.value === formData.rol)?.label}
              </Text>
              <Text style={styles.dropdownIcon}>
                {mostrarRoles ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {mostrarRoles && (
              <View
                style={styles.roleDropdown}
                accessibilityLabel="Opciones de rol"
              >
                {ROLES_DISPONIBLES.map((opcion) => (
                  <TouchableOpacity
                    key={opcion.value}
                    style={[
                      styles.roleOption,
                      formData.rol === opcion.value
                        ? styles.roleOptionSelected
                        : null,
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, rol: opcion.value }));
                      setMostrarRoles(false);
                    }}
                    accessibilityLabel={opcion.label}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: formData.rol === opcion.value,
                    }}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        formData.rol === opcion.value
                          ? styles.roleOptionTextSelected
                          : null,
                      ]}
                    >
                      {opcion.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Campo de contraseña con indicador de requisitos */}
          <AccessibleInput
            label="Contraseña *"
            value={formData.password}
            onChangeText={(valor) => actualizarCampo('password', valor)}
            placeholder="Crea una contraseña segura"
            error={errores.password}
            secureTextEntry={!mostrarPassword}
            inputRef={passwordRef}
            returnKeyType="next"
            onSubmitEditing={() => handleNextField('password')}
            accessibilityLabel="Contraseña"
            accessibilityHint="Mínimo 8 caracteres con mayúscula, minúscula, número y carácter especial"
            icon={mostrarPassword ? '👁️' : '🔒'}
          />

          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setMostrarPassword(!mostrarPassword)}
            accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Text style={styles.showPasswordText}>
              {mostrarPassword ? 'Ocultar' : 'Mostrar'} contraseña
            </Text>
          </TouchableOpacity>

          {/* Indicadores de requisitos de contraseña */}
          {formData.password.length > 0 && (
            <PasswordRequirements password={formData.password} />
          )}

          {/* Campo de confirmar contraseña */}
          <AccessibleInput
            label="Confirmar contraseña *"
            value={formData.confirmPassword}
            onChangeText={(valor) => actualizarCampo('confirmPassword', valor)}
            placeholder="Repite tu contraseña"
            error={errores.confirmPassword}
            secureTextEntry={!mostrarPassword}
            inputRef={confirmPasswordRef}
            returnKeyType="done"
            accessibilityLabel="Confirmar contraseña"
            accessibilityHint="Repite la contraseña exactamente"
          />

          {/* Botón de registro */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              cargando ? styles.buttonDisabled : null,
            ]}
            onPress={handleRegister}
            disabled={cargando}
            activeOpacity={0.7}
            accessibilityLabel={cargando ? 'Registrando usuario' : 'Crear cuenta'}
            accessibilityRole="button"
            accessibilityState={{ disabled: cargando }}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Enlace a login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Iniciar sesión"
            accessibilityRole="link"
          >
            <Text style={styles.linkText}> Inicia sesión aquí</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    color: '#111827',
  },
  inputIcon: {
    paddingLeft: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  roleInput: {
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  roleText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6B7280',
    paddingRight: 12,
  },
  roleDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 1000,
  },
  roleOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roleOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  roleOptionTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  showPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  showPasswordText: {
    color: '#4F46E5',
    fontSize: 14,
  },
  requirementsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementIcon: {
    fontSize: 14,
    marginRight: 8,
    color: '#9CA3AF',
  },
  requirementMet: {
    color: '#10B981',
  },
  requirementText: {
    fontSize: 12,
    color: '#6B7280',
  },
  requirementTextMet: {
    color: '#10B981',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  linkText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
