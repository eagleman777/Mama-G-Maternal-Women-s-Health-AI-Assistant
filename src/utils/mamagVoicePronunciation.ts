/**
 * Mama-G Voice Pronunciation Helper
 * --------------------------------------------------------------------------------
 * Handles text-to-speech audio playback for regional Ibibio and Ibeno clinical terms
 * using browser Web Speech API with graceful fallback handling.
 */

export type SupportedLanguage = 'ibb' | 'ibn' | 'en';
export type PronunciationLanguage = SupportedLanguage;

export interface PronunciationOptions {
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  fallbackLang?: string;
}

export class MamaGVoicePronunciation {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      // Some browsers load voices asynchronously
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  /**
   * Map internal custom language codes to browser-compatible BCP 47 tags.
   * Since 'ibb' and 'ibn' are rarely native browser TTS voices, we map them
   * to Nigerian English (en-NG) or West African phonetic approximations.
   */
  private resolveBcp47Lang(lang: SupportedLanguage, fallbackLang?: string): string {
    switch (lang) {
      case 'ibb':
      case 'ibn': {
        // Prefer Nigerian English accent if available for local phonetic cadence
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

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public getResolvedDialectLabel(lang: SupportedLanguage = 'ibb'): string {
    return this.resolveBcp47Lang(lang);
  }

  public speak(
    text: string,
    lang: SupportedLanguage = 'ibb',
    options: PronunciationOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        console.warn('SpeechSynthesis API is not supported in this environment.');
        reject(new Error('SpeechSynthesis not supported'));
        return;
      }

      // Refresh voice list if empty
      if (this.voices.length === 0) {
        this.loadVoices();
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.resolveBcp47Lang(lang, options.fallbackLang);
      utterance.rate = options.rate ?? 0.9; // Slightly slower for clear clinical guidance
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      // Prefer exact BCP 47 match first, then language prefix match
      const bcpLang = utterance.lang.toLowerCase();
      const matchedVoice =
        this.voices.find((v) => v.lang.toLowerCase() === bcpLang) ||
        this.voices.find((v) => v.lang.toLowerCase().startsWith(bcpLang.substring(0, 2)));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        // Ignore benign 'interrupted' / 'canceled' events when user triggers a new phrase
        if ((event as SpeechSynthesisErrorEvent)?.error === 'interrupted' || (event as SpeechSynthesisErrorEvent)?.error === 'canceled') {
          resolve();
          return;
        }
        console.error('Speech synthesis error:', event);
        reject(event);
      };

      this.synth.speak(utterance);
    });
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

// Export singleton instance for app-wide use
export const voicePronunciation = new MamaGVoicePronunciation();
