import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { getCategoryIcon } from '../../utils/categories';
import { useAuth } from '../../contexts/AuthContext';
import { TranslatableText } from '../../components/TranslatableText';

interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  username: string;
  user_id: string;
  original_language: string;
  votes: number;
  views: number;
  answer_count: number;
  created_at: string;
}

interface Answer {
  id: string;
  content: string;
  username: string;
  user_id: string;
  original_language: string;
  votes: number;
  created_at: string;
}

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [questionVote, setQuestionVote] = useState(0);
  const [answerVotes, setAnswerVotes] = useState<{ [key: string]: number }>({});
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadQuestion();
    loadAnswers();
    loadVotes();
  }, [id]);

  const loadQuestion = async () => {
    try {
      const response = await api.get(`/questions/${id}`);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error loading question:', error);
      Alert.alert('Error', 'No se pudo cargar la pregunta');
    } finally {
      setLoading(false);
    }
  };

  const loadAnswers = async () => {
    try {
      const response = await api.get(`/questions/${id}/answers`);
      setAnswers(response.data);
    } catch (error) {
      console.error('Error loading answers:', error);
    }
  };

  const loadVotes = async () => {
    try {
      // Load question vote
      const qVote = await api.get(`/votes/user/${id}?target_type=question`);
      setQuestionVote(qVote.data.vote_type);
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const handleVote = async (targetId: string, targetType: string, voteType: number) => {
    try {
      await api.post('/votes', {
        target_id: targetId,
        target_type: targetType,
        vote_type: voteType,
      });

      if (targetType === 'question') {
        setQuestionVote(questionVote === voteType ? 0 : voteType);
        loadQuestion();
      } else {
        setAnswerVotes({ ...answerVotes, [targetId]: answerVotes[targetId] === voteType ? 0 : voteType });
        loadAnswers();
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim()) {
      Alert.alert('Error', 'Por favor escribe una respuesta');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/questions/${id}/answers`, {
        content: answerContent.trim(),
      });
      setAnswerContent('');
      loadAnswers();
      loadQuestion(); // Reload to update answer count
      Alert.alert('Éxito', 'Respuesta publicada');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo publicar la respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = () => {
    Alert.alert('Eliminar Pregunta', '¿Estás seguro? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/questions/${id}`);
            router.back();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const handleDeleteAnswer = (answerId: string) => {
    Alert.alert('Eliminar Respuesta', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/answers/${answerId}`);
            loadAnswers();
            loadQuestion();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Pregunta no encontrada</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pregunta</Text>
          {user?.id === question.user_id && (
            <TouchableOpacity onPress={handleDeleteQuestion}>
              <Ionicons name="trash" size={24} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Question */}
          <View style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <View style={styles.categoryBadge}>
                <Ionicons name={getCategoryIcon(question.category) as any} size={16} color="#007AFF" />
                <Text style={styles.categoryText}>{question.category}</Text>
              </View>
              <Text style={styles.username}>@{question.username}</Text>
            </View>

            <Text style={styles.questionTitle}>{question.title}</Text>
            <TranslatableText
              text={question.content}
              originalLanguage={question.original_language}
              itemId={`question-${question.id}`}
              style={styles.questionContent}
            />

            <View style={styles.questionFooter}>
              <View style={styles.voteContainer}>
                <TouchableOpacity onPress={() => handleVote(question.id, 'question', 1)}>
                  <Ionicons
                    name={questionVote === 1 ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
                    size={28}
                    color={questionVote === 1 ? '#007AFF' : '#666'}
                  />
                </TouchableOpacity>
                <Text style={styles.voteCount}>{question.votes}</Text>
                <TouchableOpacity onPress={() => handleVote(question.id, 'question', -1)}>
                  <Ionicons
                    name={questionVote === -1 ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
                    size={28}
                    color={questionVote === -1 ? '#FF3B30' : '#666'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Ionicons name="eye" size={16} color="#666" />
                  <Text style={styles.statText}>{question.views} vistas</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="chatbubble" size={16} color="#666" />
                  <Text style={styles.statText}>{question.answer_count} respuestas</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Answers */}
          <View style={styles.answersSection}>
            <Text style={styles.answersTitle}>{answers.length} Respuestas</Text>

            {answers.map((answer) => (
              <View key={answer.id} style={styles.answerCard}>
                <View style={styles.answerHeader}>
                  <Text style={styles.answerUsername}>@{answer.username}</Text>
                  {user?.id === answer.user_id && (
                    <TouchableOpacity onPress={() => handleDeleteAnswer(answer.id)}>
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>

                <TranslatableText
                  text={answer.content}
                  originalLanguage={answer.original_language}
                  itemId={`answer-${answer.id}`}
                  style={styles.answerContent}
                />

                <View style={styles.answerFooter}>
                  <View style={styles.voteContainer}>
                    <TouchableOpacity onPress={() => handleVote(answer.id, 'answer', 1)}>
                      <Ionicons
                        name={answerVotes[answer.id] === 1 ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
                        size={24}
                        color={answerVotes[answer.id] === 1 ? '#007AFF' : '#666'}
                      />
                    </TouchableOpacity>
                    <Text style={styles.voteCount}>{answer.votes}</Text>
                    <TouchableOpacity onPress={() => handleVote(answer.id, 'answer', -1)}>
                      <Ionicons
                        name={answerVotes[answer.id] === -1 ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
                        size={24}
                        color={answerVotes[answer.id] === -1 ? '#FF3B30' : '#666'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Answer Input */}
          <View style={styles.answerInputSection}>
            <Text style={styles.answerInputTitle}>Tu Respuesta</Text>
            <TextInput
              style={styles.answerInput}
              placeholder="Escribe tu respuesta aquí..."
              placeholderTextColor="#666"
              value={answerContent}
              onChangeText={setAnswerContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitAnswer}
              disabled={submitting}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {submitting ? 'Enviando...' : 'Publicar Respuesta'}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  questionContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  categoryText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  username: {
    color: '#666',
    fontSize: 14,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 30,
  },
  questionContent: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 16,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voteCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    minWidth: 30,
    textAlign: 'center',
  },
  stats: {
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
  answersSection: {
    marginBottom: 24,
  },
  answersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  answerCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerUsername: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  answerContent: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 12,
  },
  answerFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  answerInputSection: {
    marginBottom: 32,
  },
  answerInputTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  answerInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    minHeight: 120,
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
});
