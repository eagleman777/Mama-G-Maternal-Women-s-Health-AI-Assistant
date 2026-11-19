import { useState, useCallback, useEffect } from 'react';
import {
  voicePronunciation,
  SupportedLanguage,
  PronunciationOptions,
  PronunciationEngine,
} from './mamagVoicePronunciation';

export function useMamaGPronunciation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [activeEngine, setActiveEngine] = useState<PronunciationEngine | null>(null);
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
        await voicePronunciation.speak(term, lang, {
          ...options,
          onEngineResolved: (engine) => {
            setActiveEngine(engine);
            options?.onEngineResolved?.(engine);
          },
        });
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
    activeEngine,
    error,
    isSupported: voicePronunciation.isSupported(),
    getDialectLabel: (lang: SupportedLanguage = 'ibb') =>
      voicePronunciation.getResolvedDialectLabel(lang),
  };
}
