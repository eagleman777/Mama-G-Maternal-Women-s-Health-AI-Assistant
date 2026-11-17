import { useState, useCallback, useEffect } from 'react';
import {
  voicePronunciation,
  SupportedLanguage,
  PronunciationOptions,
} from './mamagVoicePronunciation';

export function useMamaGPronunciation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      voicePronunciation.stop();
    };
  }, []);

  const playPronunciation = useCallback(
    async (
      term: string,
      lang: SupportedLanguage = 'ibb',
      options?: PronunciationOptions
    ) => {
      try {
        setError(null);
        setIsPlaying(true);
        setActiveTerm(term);
        await voicePronunciation.speak(term, lang, options);
      } catch (err: any) {
        console.error('Pronunciation playback failed:', err);
        setError(err?.message || 'Speech playback unavailable in this browser.');
      } finally {
        setIsPlaying(false);
        setActiveTerm(null);
      }
    },
    []
  );

  const stopPronunciation = useCallback(() => {
    voicePronunciation.stop();
    setIsPlaying(false);
    setActiveTerm(null);
  }, []);

  return {
    playPronunciation,
    stopPronunciation,
    isPlaying,
    activeTerm,
    error,
    isSupported: voicePronunciation.isSupported(),
    getDialectLabel: (lang: SupportedLanguage = 'ibb') =>
      voicePronunciation.getResolvedDialectLabel(lang),
  };
}
