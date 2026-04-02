import { useState } from 'react';
import api from './api';

interface TranslationCache {
  [key: string]: string;
}

export const useTranslation = () => {
  const [translationCache, setTranslationCache] = useState<TranslationCache>({});
  const [loadingTranslations, setLoadingTranslations] = useState<Set<string>>(new Set());

  const translateText = async (
    text: string,
    targetLang: string,
    sourceLang: string = 'auto',
    itemId: string
  ): Promise<string> => {
    // Check cache first
    const cacheKey = `${itemId}_${targetLang}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    // Check if already loading
    if (loadingTranslations.has(cacheKey)) {
      return text;
    }

    try {
      setLoadingTranslations(prev => new Set(prev).add(cacheKey));

      const response = await api.post('/translate', {
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
      });

      const translatedText = response.data.translated_text;

      // Update cache
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translatedText,
      }));

      setLoadingTranslations(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      setLoadingTranslations(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
      return text;
    }
  };

  const isTranslating = (itemId: string, targetLang: string): boolean => {
    const cacheKey = `${itemId}_${targetLang}`;
    return loadingTranslations.has(cacheKey);
  };

  const hasTranslation = (itemId: string, targetLang: string): boolean => {
    const cacheKey = `${itemId}_${targetLang}`;
    return !!translationCache[cacheKey];
  };

  const getTranslation = (itemId: string, targetLang: string): string | null => {
    const cacheKey = `${itemId}_${targetLang}`;
    return translationCache[cacheKey] || null;
  };

  return {
    translateText,
    isTranslating,
    hasTranslation,
    getTranslation,
  };
};
