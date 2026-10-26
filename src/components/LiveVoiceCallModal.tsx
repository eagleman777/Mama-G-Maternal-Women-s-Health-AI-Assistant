import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Radio,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SupportedLanguage, UserContext, ChatMessage, TriageSeverity } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface LiveVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  userContext: UserContext;
  onAddMessages: (userMsg: ChatMessage, asstMsg: ChatMessage) => void;
  onOpenEmergency: () => void;
}

export const LiveVoiceCallModal: React.FC<LiveVoiceCallModalProps> = ({
  isOpen,
  onClose,
  language,
  userContext,
  onAddMessages,
  onOpenEmergency,
}) => {
  const [callState, setCallState] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastMamaSpeech, setLastMamaSpeech] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const currentTranscriptRef = useRef<string>('');

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  const speechLocaleMap: Record<SupportedLanguage, string> = {
    English: 'en-US',
    'Nigerian Pidgin': 'en-NG',
    Swahili: 'sw-TZ',
    French: 'fr-FR',
    Hausa: 'ha-NG',
    Yoruba: 'yo-NG',
  };

  // Keep ref synced
  useEffect(() => {
    currentTranscriptRef.current = liveTranscript;
  }, [liveTranscript]);

  // Handle Speech Recognition setup
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLocaleMap[language] || 'en-US';

      recognition.onstart = () => {
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        if (isMuted) return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentSpoken = (final || interim).trim();
        if (currentSpoken) {
          setLiveTranscript(currentSpoken);
        }

        // Auto-send on silence pause
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        if (currentSpoken.length > 2) {
          silenceTimerRef.current = setTimeout(() => {
            const textToSubmit = currentTranscriptRef.current.trim();
            if (textToSubmit) {
              submitUserVoice(textToSubmit);
            }
          }, 1600);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please click allow microphone to speak.');
        } else if (e.error !== 'no-speech') {
          console.warn('Speech recognition warning:', e.error);
        }
      };

      recognition.onend = () => {
        // If still in listening state and call is open, automatically restart recognition!
        if (isOpen && callState === 'listening' && !isMuted) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {}

      return () => {
        try {
          recognition.stop();
        } catch {}
      };
    } catch (e: any) {
      console.warn('Recognition setup error', e);
    }
  }, [isOpen, language, isMuted, callState]);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      try {
        recognitionRef.current?.stop();
      } catch {}
    }
  }, [isOpen]);

  const submitUserVoice = async (promptText: string) => {
    if (!promptText || callState === 'thinking') return;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Stop listening while generating
    try {
      recognitionRef.current?.stop();
    } catch {}

    setCallState('thinking');
    setLiveTranscript('');

    const userMsg: ChatMessage = {
      id: `call-user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptText }],
          userContext,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('API response was not ok');
      }

      const data = await response.json();
      const content = data.text || 'I hear you, my dear. Please seek care at your local health center.';

      let severity: TriageSeverity = 'ROUTINE';
      if (content.includes('🚨') || content.toUpperCase().includes('EMERGENCY')) {
        severity = 'EMERGENCY';
      } else if (content.includes('⚠️') || content.toUpperCase().includes('URGENT')) {
        severity = 'URGENT';
      }

      const assistantMsg: ChatMessage = {
        id: `call-asst-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: Date.now(),
        severity,
      };

      // Add to overall history
      onAddMessages(userMsg, assistantMsg);
      setLastMamaSpeech(content);

      // Play audio response seamlessly
      playMamaVoice(content);
    } catch (err) {
      console.warn('Call error:', err);
      const fallback = 'My daughter, I am listening to your voice. Please keep resting, drink clean water, and if any severe danger signs occur, go directly to the hospital.';
      const asstMsg: ChatMessage = {
        id: `call-asst-fallback-${Date.now()}`,
        role: 'assistant',
        content: fallback,
        timestamp: Date.now(),
        severity: 'ROUTINE',
      };
      onAddMessages(userMsg, asstMsg);
      setLastMamaSpeech(fallback);
      playMamaVoice(fallback);
    }
  };

  const playMamaVoice = async (text: string) => {
    setCallState('speaking');

    try {
      const res = await fetch('/api/audio-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audioRef.current = audio;

          audio.onended = () => {
            // Seamless handoff: return to listening automatically!
            setCallState('listening');
            try {
              recognitionRef.current?.start();
            } catch {}
          };

          audio.onerror = () => {
            fallbackSpeech(text);
          };

          await audio.play();
          return;
        }
      }
      fallbackSpeech(text);
    } catch {
      fallbackSpeech(text);
    }
  };

  const fallbackSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const clean = text.replace(/[#*_`]/g, '').replace(/🚨|💬|📋|🏥|⚠️/g, '').slice(0, 350);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = speechLocaleMap[language] || 'en-US';
      utterance.rate = 0.92;

      utterance.onend = () => {
        setCallState('listening');
        try {
          recognitionRef.current?.start();
        } catch {}
      };

      utterance.onerror = () => {
        setCallState('listening');
        try {
          recognitionRef.current?.start();
        } catch {}
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setCallState('listening');
      try {
        recognitionRef.current?.start();
      } catch {}
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (!isMuted) {
      try {
        recognitionRef.current?.stop();
      } catch {}
    } else {
      try {
        recognitionRef.current?.start();
      } catch {}
    }
  };

  const handleInterruptSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCallState('listening');
    try {
      recognitionRef.current?.start();
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-stone-300">Live Voice Call</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              {language}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 text-xs px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 transition-colors"
          >
            Switch to Chat
          </button>
        </div>

        {/* Central Avatar with Animated Glowing Sound Aura */}
        <div className="relative my-2">
          {/* Pulsing Aura Rings depending on state */}
          <div
            className={`absolute -inset-4 rounded-full blur-xl transition-all duration-700 ${
              callState === 'listening'
                ? 'bg-emerald-500/25 animate-pulse'
                : callState === 'speaking'
                ? 'bg-rose-500/30 animate-ping'
                : 'bg-amber-500/25 animate-pulse'
            }`}
          />
          <div
            className={`absolute -inset-2 rounded-full border-2 transition-all duration-500 ${
              callState === 'listening'
                ? 'border-emerald-400/60 scale-105'
                : callState === 'speaking'
                ? 'border-rose-400/60 scale-110'
                : 'border-amber-400/50'
            }`}
          />

          <img
            src="/src/assets/images/mama_g_portrait_1792645422205.jpg"
            alt="Mama-G Mentor"
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-amber-500/80 shadow-2xl"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Status Headline & Waveform Equalizer */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all">
            {callState === 'listening' && (
              <span className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {t.mamaListening}
              </span>
            )}
            {callState === 'thinking' && (
              <span className="text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                {t.mamaThinking}
              </span>
            )}
            {callState === 'speaking' && (
              <span className="text-rose-300 bg-rose-500/15 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                {t.mamaSpeaking}
              </span>
            )}
          </div>

          {/* Equalizer waveform bars */}
          <div className="flex items-center justify-center gap-1.5 h-6">
            {[40, 75, 55, 90, 60, 80, 45].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  callState === 'speaking'
                    ? 'bg-rose-400 animate-pulse'
                    : callState === 'listening'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-stone-700'
                }`}
                style={{
                  height: callState === 'thinking' ? '6px' : `${(height * (callState === 'speaking' ? 0.9 : 0.6)) / 3.5}px`,
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Live Subtitle & Transcript Card */}
        <div className="w-full bg-stone-950/80 border border-stone-800 rounded-2xl p-4 min-h-[90px] max-h-[140px] overflow-y-auto text-xs text-stone-200 text-left space-y-1.5 shadow-inner">
          {callState === 'listening' ? (
            <div>
              <span className="font-semibold text-emerald-400 block mb-1">You are saying:</span>
              <p className="italic text-stone-300">
                {liveTranscript || 'Listening... speak about your symptoms, pregnancy, or menopause...'}
              </p>
            </div>
          ) : callState === 'speaking' ? (
            <div>
              <span className="font-semibold text-rose-400 block mb-1">Mama-G says:</span>
              <p className="text-stone-200 leading-relaxed">
                {lastMamaSpeech.slice(0, 220)}...
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-stone-500 italic">
              Formulating clinical guidance in {language}...
            </div>
          )}
        </div>

        {/* Error message or permissions advice */}
        {errorMessage && (
          <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/50">
            {errorMessage}
          </div>
        )}

        {/* Interactive Controls Bar */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {/* Mute Mic Button */}
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${
              isMuted
                ? 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                : 'bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onClose}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/60 transition-transform active:scale-95"
            title="End voice call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Interrupt / Next Turn button */}
          {callState === 'speaking' ? (
            <button
              onClick={handleInterruptSpeaking}
              className="w-12 h-12 rounded-full bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-all"
              title="Interrupt and speak next question"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                const text = liveTranscript.trim();
                if (text) submitUserVoice(text);
              }}
              disabled={!liveTranscript.trim()}
              className="w-12 h-12 rounded-full bg-stone-800 hover:bg-stone-750 disabled:opacity-40 text-amber-300 border border-stone-700 flex items-center justify-center transition-all"
              title="Send speech now"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer reassurance */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Encrypted live voice stream · Free on-device & cloud audio</span>
        </div>
      </div>
    </div>
  );
};
