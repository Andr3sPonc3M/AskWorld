import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const ROLES_DISPONIBLES = [
  { label: 'Estudiante', value: 'estudiante' },
  { label: 'Profesor', value: 'profesor' },
  { label: 'Administrador', value: 'administrador' },
  { label: 'Usuario', value: 'usuario' }
];

const RegisterScreen = ({ navigation }) => {
  const { registro, cargando, limpiarError } = useAuth();
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState('usuario');
  const [mostrarRoles, setMostrarRoles] = useState(false);
  
  const [errores, setErrores] = useState({});

  // Limpiar errores cuando el componente se desmonta
  React.useEffect(() => {
    return () => limpiarError();
  }, []);

  // Validar campos del formulario
  const validarCampos = () => {
    const nuevosErrores = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (nombre.length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!email) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nuevosErrores.email = 'Ingresa un email válido';
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar registro
  const handleRegister = async () => {
    if (!validarCampos()) return;

    const resultado = await registro({
      nombre,
      email,
      password,
      rol
    });

    if (!resultado.success) {
      Alert.alert(
        'Error',
        resultado.message || 'No se pudo completar el registro',
        [{ text: 'OK' }]
      );
    }
  };

  // Renderizar selector de rol
  const renderRoleSelector = () => {
    return ROLES_DISPONIBLES.map((opcion) => (
      <TouchableOpacity
        key={opcion.value}
        style={[
          styles.roleOption,
          rol === opcion.value ? styles.roleOptionSelected : null
        ]}
        onPress={() => {
          setRol(opcion.value);
          setMostrarRoles(false);
        }}
      >
        <Text
          style={[
            styles.roleOptionText,
            rol === opcion.value ? styles.roleOptionTextSelected : null
          ]}
        >
          {opcion.label}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para comenzar</Text>

        <View style={styles.form}>
          {/* Campo de nombre */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={[styles.input, errores.nombre ? styles.inputError : null]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              placeholderTextColor="#9CA3AF"
            />
            {errores.nombre && (
              <Text style={styles.errorText}>{errores.nombre}</Text>
            )}
          </View>

          {/* Campo de email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errores.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errores.email && (
              <Text style={styles.errorText}>{errores.email}</Text>
            )}
          </View>

          {/* Selector de rol */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Rol</Text>
            <TouchableOpacity
              style={[styles.input, styles.roleInput]}
              onPress={() => setMostrarRoles(!mostrarRoles)}
            >
              <Text style={styles.roleText}>
                {ROLES_DISPONIBLES.find(r => r.value === rol)?.label}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            
            {mostrarRoles && (
              <View style={styles.roleDropdown}>
                {renderRoleSelector()}
              </View>
            )}
          </View>

          {/* Campo de contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, errores.password ? styles.inputError : null]}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={true}
            />
            {errores.password && (
              <Text style={styles.errorText}>{errores.password}</Text>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={[styles.input, errores.confirmPassword ? styles.inputError : null]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={true}
            />
            {errores.confirmPassword && (
              <Text style={styles.errorText}>{errores.confirmPassword}</Text>
            )}
          </View>

          {/* Botón de registro */}
          <TouchableOpacity
            style={[styles.registerButton, cargando ? styles.buttonDisabled : null]}
            onPress={handleRegister}
            disabled={cargando}
            activeOpacity={0.7}
          >
            <Text style={styles.registerButtonText}>
              {cargando ? 'Registrando...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Enlace a login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
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
    backgroundColor: '#F9FAFB'
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827'
  },
  inputError: {
    borderColor: '#EF4444'
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4
  },
  roleInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  roleText: {
    fontSize: 16,
    color: '#111827'
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6B7280'
  },
  roleDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    overflow: 'hidden'
  },
  roleOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  roleOptionSelected: {
    backgroundColor: '#EEF2FF'
  },
  roleOptionText: {
    fontSize: 16,
    color: '#374151'
  },
  roleOptionTextSelected: {
    color: '#4F46E5',
    fontWeight: '600'
  },
  registerButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14
  },
  linkText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default RegisterScreen;
