import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { getCategoryIcon } from '../../utils/categories';
import { useAuth } from '../../contexts/AuthContext';

interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  username: string;
  original_language: string;
  votes: number;
  views: number;
  answer_count: number;
  created_at: string;
}

export default function HomeScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await api.get('/questions?sort=recent&limit=50');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQuestions();
    setRefreshing(false);
  }, []);

  const renderQuestion = ({ item }: { item: Question }) => (
    <TouchableOpacity
      style={styles.questionCard}
      onPress={() => router.push(`/question/${item.id}` as any)}
    >
      <View style={styles.questionHeader}>
        <View style={styles.categoryBadge}>
          <Ionicons name={getCategoryIcon(item.category) as any} size={14} color="#007AFF" />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.username}>@{item.username}</Text>
      </View>

      <Text style={styles.questionTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.questionContent} numberOfLines={2}>
        {item.content}
      </Text>

      <View style={styles.questionFooter}>
        <View style={styles.stat}>
          <Ionicons name="arrow-up" size={16} color="#666" />
          <Text style={styles.statText}>{item.votes}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="chatbubble" size={16} color="#666" />
          <Text style={styles.statText}>{item.answer_count}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="eye" size={16} color="#666" />
          <Text style={styles.statText}>{item.views}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="language" size={16} color="#666" />
          <Text style={styles.statText}>{item.original_language.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AskWorld</Text>
          <Text style={styles.headerSubtitle}>Bienvenido, {user?.username}</Text>
        </View>
        <Ionicons name="globe" size={32} color="#007AFF" />
      </View>

      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="help-circle-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No hay preguntas aún</Text>
            <Text style={styles.emptySubtext}>Sé el primero en preguntar</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  username: {
    color: '#666',
    fontSize: 12,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  questionContent: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 12,
  },
  questionFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#666',
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
});
