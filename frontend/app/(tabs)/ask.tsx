import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CATEGORIES } from '../../utils/categories';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AskScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedCategory) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await api.post('/questions', {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
      });
      Alert.alert('Éxito', 'Pregunta publicada correctamente', [
        { text: 'OK', onPress: () => {
          setTitle('');
          setContent('');
          setSelectedCategory('');
          router.push('/(tabs)/home');
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo publicar la pregunta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Hacer una Pregunta</Text>
            <Text style={styles.headerSubtitle}>Comparte tu duda con el mundo</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe un título claro y conciso"
                placeholderTextColor="#666"
                value={title}
                onChangeText={setTitle}
                maxLength={150}
              />
              <Text style={styles.charCount}>{title.length}/150</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu pregunta en detalle..."
                placeholderTextColor="#666"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.charCount}>{content.length}/1000</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.name && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={18}
                      color={selectedCategory === category.name ? '#fff' : '#007AFF'}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === category.name && styles.categoryChipTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {loading ? 'Publicando...' : 'Publicar Pregunta'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  form: {
    padding: 16,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  textArea: {
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
