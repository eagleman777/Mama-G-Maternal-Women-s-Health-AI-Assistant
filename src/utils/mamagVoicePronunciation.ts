/**
 * Mama-G Voice Pronunciation Helper (Neural Akwa Ibom Feminine TTS + Offline Phonetic Fallback)
 * --------------------------------------------------------------------------------
 * Handles authentic feminine-voice audio playback for Akwa Ibom Ibibio ('ibb'),
 * coastal Ibeno ('ibn' / Ibọnọ), and English ('en') clinical terms.
 *
 * Pronunciation references:
 *  - Ibibio [ibb]: Uyai Akwa Ibom compilation (https://youtu.be/rQUuq6oiV9c)
 *  - Ibeno  [ibn]: Nigeria Oral Languages Documentation Ibeno dialect documentary
 *                  (https://youtu.be/LEFo6SwRrCo), rendered in a gentle feminine voice.
 *
 * Playback strategy:
 *  1. Online primary path: Synthesizes feminine Akwa Ibom Ibibio/Ibeno speech via
 *     server-side Gemini TTS (/api/audio-tts, voice 'Kore') with dialect-specific
 *     phonetic cues and caches WAV clips in memory for instant replay.
 *  2. Offline fallback path: Converts Ibibio/Ibeno orthography to syllable-paced
 *     phonetic respelling and selects a feminine browser SpeechSynthesis voice
 *     with warm elevated pitch (1.15 for Ibeno, 1.08 for Ibibio).
 */

import {
  toIbibioPhoneticSpeech,
  toIbenoPhoneticSpeech,
} from '../data/ibibioPronunciationGuide';

export type SupportedLanguage = 'ibb' | 'ibn' | 'en';
export type PronunciationLanguage = SupportedLanguage;
export type PronunciationEngine = 'gemini-tts' | 'offline-phonetic';

export interface PronunciationOptions {
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  fallbackLang?: string;
  preferOfflineOnly?: boolean;
  onEngineResolved?: (engine: PronunciationEngine) => void;
}

const FEMININE_VOICE_HINTS = [
  'female',
  'woman',
  'samantha',
  'victoria',
  'karen',
  'moira',
  'tessa',
  'serena',
  'fiona',
  'kate',
  'martha',
  'zira',
  'hazel',
  'susan',
  'aria',
  'jenny',
  'sonia',
  'libby',
  'natasha',
  'clara',
  'ava',
  'allison',
  'emma',
  'amy',
  'joanna',
  'salli',
  'ezinne',
  'kore',
];

const MASCULINE_VOICE_HINTS = [
  'male',
  'daniel',
  'alex',
  'david',
  'mark',
  'george',
  'james',
  'ryan',
  'guy',
  'abeo',
  'fred',
  'arthur',
  'oliver',
];

export class MamaGVoicePronunciation {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private activeAudio: HTMLAudioElement | null = null;
  private activeAbortController: AbortController | null = null;
  private wavCache: Map<string, string> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  private resolveBcp47Lang(lang: SupportedLanguage, fallbackLang?: string): string {
    switch (lang) {
      case 'ibb':
      case 'ibn': {
        const ngVoice = this.voices.find((v) => v.lang.toLowerCase() === 'en-ng');
        if (ngVoice) return 'en-NG';
        const gbVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('en-gb'));
        if (gbVoice) return 'en-GB';
        return fallbackLang || 'en-GB';
      }
      case 'en':
      default:
        return fallbackLang || 'en-US';
    }
  }

  private pickFeminineVoice(bcpLang: string): SpeechSynthesisVoice | undefined {
    const lowerLang = bcpLang.toLowerCase();
    const langPrefix = lowerLang.substring(0, 2);

    const isLikelyFemale = (v: SpeechSynthesisVoice) => {
      const name = v.name.toLowerCase();
      return FEMININE_VOICE_HINTS.some((hint) => name.includes(hint));
    };
    const isLikelyMale = (v: SpeechSynthesisVoice) => {
      const name = v.name.toLowerCase();
      return (
        !isLikelyFemale(v) &&
        MASCULINE_VOICE_HINTS.some((hint) => name.includes(hint))
      );
    };

    const exactPool = this.voices.filter((v) => v.lang.toLowerCase() === lowerLang);
    const prefixPool = this.voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

    return (
      exactPool.find(isLikelyFemale) ||
      prefixPool.find(isLikelyFemale) ||
      exactPool.find((v) => !isLikelyMale(v)) ||
      prefixPool.find((v) => !isLikelyMale(v)) ||
      exactPool[0] ||
      prefixPool[0]
    );
  }

  private getPhoneticGuide(text: string, lang: SupportedLanguage): string | undefined {
    if (lang === 'ibn') return toIbenoPhoneticSpeech(text);
    if (lang === 'ibb') return toIbibioPhoneticSpeech(text);
    return undefined;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && (this.synth !== null || typeof Audio !== 'undefined');
  }

  public getResolvedDialectLabel(lang: SupportedLanguage = 'ibb'): string {
    if (lang === 'ibb') return 'Ibibio (Uyai Akwa Ibom · Feminine Voice)';
    if (lang === 'ibn') return 'Ibeno / Ibọnọ (Coastal Documentary · Feminine Voice)';
    return this.resolveBcp47Lang(lang);
  }

  private playBase64Wav(base64Audio: string, volume: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.volume = Math.max(0, Math.min(1, volume));
      this.activeAudio = audio;

      audio.onended = () => {
        if (this.activeAudio === audio) this.activeAudio = null;
        resolve();
      };
      audio.onerror = () => {
        if (this.activeAudio === audio) this.activeAudio = null;
        reject(new Error('Audio element failed to play WAV response'));
      };

      audio.play().catch((err) => {
        if (this.activeAudio === audio) this.activeAudio = null;
        reject(err);
      });
    });
  }

  private async tryServerGeminiTts(
    text: string,
    lang: SupportedLanguage,
    volume: number
  ): Promise<boolean> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    if (navigator.onLine === false) return false;

    const cacheKey = `${lang}::${text.trim().toLowerCase()}`;
    const cachedWav = this.wavCache.get(cacheKey);
    if (cachedWav) {
      await this.playBase64Wav(cachedWav, volume);
      return true;
    }

    const controller = new AbortController();
    this.activeAbortController = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 9000);

    try {
      const serverLanguage = lang === 'ibb' ? 'Ibibio' : lang === 'ibn' ? 'Ibeno' : 'English';
      const phoneticGuide = this.getPhoneticGuide(text, lang);

      const res = await fetch('/api/audio-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: serverLanguage,
          phoneticGuide,
        }),
        signal: controller.signal,
      });

      if (!res.ok) return false;
      const data = await res.json();
      if (!data?.audioBase64) return false;

      if (this.wavCache.size > 40) {
        const oldestKey = this.wavCache.keys().next().value;
        if (oldestKey) this.wavCache.delete(oldestKey);
      }
      this.wavCache.set(cacheKey, data.audioBase64);

      await this.playBase64Wav(data.audioBase64, volume);
      return true;
    } catch {
      return false;
    } finally {
      window.clearTimeout(timeoutId);
      if (this.activeAbortController === controller) {
        this.activeAbortController = null;
      }
    }
  }

  private speakOfflineBrowser(
    text: string,
    lang: SupportedLanguage,
    options: PronunciationOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('SpeechSynthesis not supported'));
        return;
      }

      if (this.voices.length === 0) {
        this.loadVoices();
      }

      this.synth.cancel();

      const spokenText = this.getPhoneticGuide(text, lang) || text;
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = this.resolveBcp47Lang(lang, options.fallbackLang);
      utterance.rate = options.rate ?? (lang === 'en' ? 0.92 : 0.84);
      // Warm feminine vocal pitch (especially for Ibeno feminine-voice requirement)
      utterance.pitch = options.pitch ?? (lang === 'ibn' ? 1.15 : lang === 'ibb' ? 1.08 : 1.04);
      utterance.volume = options.volume ?? 1.0;

      const matchedVoice = this.pickFeminineVoice(utterance.lang);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        if (
          (event as SpeechSynthesisErrorEvent)?.error === 'interrupted' ||
          (event as SpeechSynthesisErrorEvent)?.error === 'canceled'
        ) {
          resolve();
          return;
        }
        console.error('Speech synthesis error:', event);
        reject(event);
      };

      this.synth.speak(utterance);
    });
  }

  public async speak(
    text: string,
    lang: SupportedLanguage = 'ibb',
    options: PronunciationOptions = {}
  ): Promise<void> {
    this.stop();

    if (!options.preferOfflineOnly) {
      const playedNeural = await this.tryServerGeminiTts(text, lang, options.volume ?? 1.0);
      if (playedNeural) {
        options.onEngineResolved?.('gemini-tts');
        return;
      }
    }

    options.onEngineResolved?.('offline-phonetic');
    await this.speakOfflineBrowser(text, lang, options);
  }

  public stop() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

// Export singleton instance for app-wide use
export const voicePronunciation = new MamaGVoicePronunciation();
