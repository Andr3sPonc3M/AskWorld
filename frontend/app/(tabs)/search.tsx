import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { CATEGORIES, getCategoryIcon } from '../../utils/categories';

interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  username: string;
  votes: number;
  answer_count: number;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [results, setResults] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchQuery && !selectedCategory) return;

    setLoading(true);
    try {
      let url = '/questions?';
      if (searchQuery) {
        url = `/questions/search/query?q=${encodeURIComponent(searchQuery)}`;
      }
      if (selectedCategory) {
        url += `${searchQuery ? '&' : ''}category=${encodeURIComponent(selectedCategory)}`;
      }
      const response = await api.get(url);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.name && styles.categoryChipActive,
      ]}
      onPress={() => {
        setSelectedCategory(selectedCategory === item.name ? null : item.name);
      }}
    >
      <Ionicons
        name={item.icon as any}
        size={18}
        color={selectedCategory === item.name ? '#fff' : '#007AFF'}
      />
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item.name && styles.categoryChipTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderQuestion = ({ item }: { item: Question }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`/question/${item.id}` as any)}
    >
      <View style={styles.resultHeader}>
        <View style={styles.categoryBadge}>
          <Ionicons name={getCategoryIcon(item.category) as any} size={14} color="#007AFF" />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      <Text style={styles.resultTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.resultContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.resultFooter}>
        <View style={styles.stat}>
          <Ionicons name="arrow-up" size={16} color="#666" />
          <Text style={styles.statText}>{item.votes}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="chatbubble" size={16} color="#666" />
          <Text style={styles.statText}>{item.answer_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buscar</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busca preguntas..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="send" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search" size={64} color="#666" />
              <Text style={styles.emptyText}>Busca preguntas</Text>
              <Text style={styles.emptySubtext}>Escribe algo o selecciona una categoría</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 16,
  },
  categoriesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContent: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  resultHeader: {
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
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  resultContent: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  resultFooter: {
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
    textAlign: 'center',
  },
});
