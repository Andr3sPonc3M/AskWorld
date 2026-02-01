import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';

// Colores para cada rol
const COLORES_ROL = {
  estudiante: '#10B981', // Verde
  profesor: '#3B82F6',   // Azul
  administrador: '#EF4444', // Rojo
  usuario: '#6B7280'     // Gris
};

const ICONOS_ROL = {
  estudiante: '📚',
  profesor: '👨‍🏫',
  administrador: '⚙️',
  usuario: '👤'
};

const HomeScreen = () => {
  const { usuario, logout, cargando } = useAuth();

  // Manejar cierre de sesión
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: logout 
        }
      ]
    );
  };

  // Obtener información del usuario o mostrar valores por defecto
  const nombreUsuario = usuario?.nombre || 'Usuario';
  const rolUsuario = usuario?.rol || 'usuario';
  const emailUsuario = usuario?.email || 'No disponible';
  
  const colorRol = COLORES_ROL[rolUsuario] || COLORES_ROL.usuario;
  const iconoRol = ICONOS_ROL[rolUsuario] || ICONOS_ROL.usuario;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header con bienvenida */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>{iconoRol}</Text>
          </View>
          <Text style={styles.welcomeText}>¡Bienvenido!</Text>
          <Text style={styles.userName}>{nombreUsuario}</Text>
        </View>

        {/* Tarjeta de información del usuario */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información de tu Cuenta</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{emailUsuario}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rol:</Text>
            <View style={[styles.roleBadge, { backgroundColor: `${colorRol}20` }]}>
              <Text style={[styles.roleText, { color: colorRol }]}>
                {rolUsuario.charAt(0).toUpperCase() + rolUsuario.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Activo</Text>
            </View>
          </View>
        </View>

        {/* Tarjeta de características según el rol */}
        <View style={styles.featuresCard}>
          <Text style={styles.cardTitle}>Tus Privilegios ({rolUsuario})</Text>
          <Text style={styles.featuresText}>
            {rolUsuario === 'administrador' && '• Acceso completo al sistema\n• Gestión de usuarios\n• Configuración del sistema'}
            {rolUsuario === 'profesor' && '• Gestión de cursos\n• Evaluación de estudiantes\n• Material didáctico'}
            {rolUsuario === 'estudiante' && '• Visualización de cursos\n• Entrega de tareas\n• Calendario académico'}
            {rolUsuario === 'usuario' && '• Acceso básico\n• Perfil personalizado\n•-notificaciones'}
          </Text>
        </View>

        {/* Botón de logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={cargando}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          Auth System v1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  avatarIcon: {
    fontSize: 48
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827'
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280'
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500'
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6
  },
  statusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500'
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  featuresText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600'
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF'
  }
});

export default HomeScreen;
