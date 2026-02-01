import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import InputText from '../components/InputText';
import PrimaryButton from '../components/PrimaryButton';

const LoginScreen = ({ navigation }) => {
  const { login, error, limpiarError, cargando } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState(null);
  const [errorPassword, setErrorPassword] = useState(null);

  // Limpiar errores cuando el componente se monta
  React.useEffect(() => {
    return () => limpiarError();
  }, []);

  // Validar campos
  const validarCampos = () => {
    let esValido = true;
    setErrorEmail(null);
    setErrorPassword(null);

    if (!email) {
      setErrorEmail('El email es obligatorio');
      esValido = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorEmail('Ingresa un email válido');
      esValido = false;
    }

    if (!password) {
      setErrorPassword('La contraseña es obligatoria');
      esValido = false;
    }

    return esValido;
  };

  // Manejar inicio de sesión
  const handleLogin = async () => {
    if (!validarCampos()) return;

    const resultado = await login(email, password);

    if (!resultado.success) {
      Alert.alert(
        'Error',
        resultado.message || 'Credenciales inválidas',
        [{ text: 'OK' }]
      );
    }
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
        {/* Logo o título */}
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <InputText
            valor={email}
            setValor={setEmail}
            placeholder="tu@email.com"
            textoLabel="Email"
            keyboardType="email-address"
            error={errorEmail}
          />

          <InputText
            valor={password}
            setValor={setPassword}
            placeholder="Tu contraseña"
            textoLabel="Contraseña"
            secureTextEntry={true}
            error={errorPassword}
          />

          {/* Olvidé mi contraseña */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => Alert.alert('Info', 'Funcionalidad en desarrollo')}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón de login */}
          <PrimaryButton
            titulo="Iniciar Sesión"
            onPress={handleLogin}
            cargando={cargando}
          />

          {/* Error general */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Enlace a registro */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}> Regístrate aquí</Text>
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
    paddingVertical: 40,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280'
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20
  },
  forgotPasswordText: {
    color: '#4F46E5',
    fontSize: 14
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center'
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

export default LoginScreen;
