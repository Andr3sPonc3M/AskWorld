import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

const InputText = ({
  valor,
  setValor,
  placeholder,
  textoLabel,
  keyboardType = 'default',
  secureTextEntry = false,
  error = null,
  editable = true,
  maxLength,
  multiline = false,
  numberOfLines = 1
}) => {
  return (
    <View style={styles.container}>
      {textoLabel && <Text style={styles.label}>{textoLabel}</Text>}
      
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <TextInput
          style={[styles.input, !editable ? styles.inputDisabled : null]}
          value={valor}
          onChangeText={setValor}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  input: {
    fontSize: 16,
    color: '#111827',
    minHeight: 24
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280'
  },
  inputError: {
    borderColor: '#EF4444'
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4
  }
});

export default InputText;
