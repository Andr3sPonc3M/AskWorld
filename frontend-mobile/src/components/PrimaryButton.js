import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const PrimaryButton = ({
  titulo,
  onPress,
  cargando = false,
  deshabilitado = false,
  estilo = {},
  textoEstilo = {}
}) => {
  const puedePresionar = !cargando && !deshabilitado;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        cargando || deshabilitado ? styles.buttonDisabled : null,
        estilo
      ]}
      onPress={onPress}
      disabled={!puedePresionar}
      activeOpacity={0.7}
    >
      {cargando ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={[styles.buttonText, textoEstilo]}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default PrimaryButton;
