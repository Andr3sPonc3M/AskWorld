import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Localization from 'expo-localization';
import { useTranslation } from '../hooks/useTranslation';

interface TranslatableTextProps {
  text: string;
  originalLanguage: string;
  itemId: string;
  style?: any;
  showLanguageBadge?: boolean;
}

export const TranslatableText: React.FC<TranslatableTextProps> = ({
  text,
  originalLanguage,
  itemId,
  style,
  showLanguageBadge = true,
}) => {
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const { translateText, isTranslating } = useTranslation();
  
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  const needsTranslation = originalLanguage !== deviceLanguage;

  const handleTranslate = async () => {
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }

    if (translatedText) {
      setShowTranslated(true);
      return;
    }

    const translated = await translateText(text, deviceLanguage, originalLanguage, itemId);
    setTranslatedText(translated);
    setShowTranslated(true);
  };

  const isLoading = isTranslating(itemId, deviceLanguage);

  return (
    <View>
      <Text style={style}>{showTranslated && translatedText ? translatedText : text}</Text>
      
      {needsTranslation && (
        <View style={styles.translationControls}>
          {showLanguageBadge && (
            <View style={styles.languageBadge}>
              <Ionicons name="language" size={12} color="#666" />
              <Text style={styles.languageText}>
                {showTranslated ? `Traducido de ${originalLanguage.toUpperCase()}` : originalLanguage.toUpperCase()}
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.translateButton}
            onPress={handleTranslate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <>
                <Ionicons
                  name={showTranslated ? 'eye-off' : 'language'}
                  size={14}
                  color="#007AFF"
                />
                <Text style={styles.translateButtonText}>
                  {showTranslated ? 'Ver original' : 'Traducir'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  translationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languageText: {
    fontSize: 11,
    color: '#666',
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#007AFF20',
    borderRadius: 6,
  },
  translateButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});
