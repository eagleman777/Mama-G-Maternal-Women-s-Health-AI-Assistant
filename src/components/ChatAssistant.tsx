import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  User,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  RefreshCw,
  Baby,
  PhoneCall,
  Radio,
} from 'lucide-react';
import { ChatMessage, SupportedLanguage, UserContext, TriageSeverity } from '../types';
import { EMERGENCY_RED_FLAGS } from '../data/clinicalKnowledge';
import { UI_TRANSLATIONS } from '../data/translations';
import { LiveVoiceCallModal } from './LiveVoiceCallModal';

interface ChatAssistantProps {
  language: SupportedLanguage;
  userContext: UserContext;
  setUserContext: React.Dispatch<React.SetStateAction<UserContext>>;
  onOpenKickCounter: () => void;
  onOpenEmergency: () => void;
  onOpenFacilities?: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  language,
  userContext,
  setUserContext,
  onOpenKickCounter,
  onOpenEmergency,
  onOpenFacilities,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### ${t.assistantWelcomeTitle}\n\n${t.assistantWelcomeBody}`,
      timestamp: Date.now(),
      severity: 'ROUTINE',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load chat history from localStorage on first load for offline resilience
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mama_g_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {}
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mama_g_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Dynamic Welcome message update when language changes and chat is fresh
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1 && prev[0]?.id === 'welcome') {
        return [
          {
            id: 'welcome',
            role: 'assistant',
            content: `### ${t.assistantWelcomeTitle}\n\n${t.assistantWelcomeBody}`,
            timestamp: Date.now(),
            severity: 'ROUTINE',
          },
        ];
      }
      return prev;
    });
  }, [language, t]);

  const speechLocaleMap: Record<SupportedLanguage, string> = {
    English: 'en-US',
    'Nigerian Pidgin': 'en-NG',
    Swahili: 'sw-TZ',
    French: 'fr-FR',
    Hausa: 'ha-NG',
    Yoruba: 'yo-NG',
  };

  // Speech-to-text setup using Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLocaleMap[language] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setInput((prev) => (prev ? `${prev.trim()} ${final.trim()}` : final.trim()));
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access.');
        } else if (e.error !== 'no-speech') {
          setSpeechError(`Voice input error: ${e.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleStopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayingMessageId(null);
  };

  const handlePlayAudio = async (msg: ChatMessage) => {
    // If already playing this message, stop
    if (playingMessageId === msg.id) {
      handleStopAudio();
      return;
    }

    handleStopAudio();
    setPlayingMessageId(msg.id);

    try {
      // 1. Try server Gemini TTS with the exact selected language
      const res = await fetch('/api/audio-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content, language }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.onended = () => setPlayingMessageId(null);
          audio.onerror = () => fallbackBrowserSpeech(msg.content);
          setCurrentAudio(audio);
          await audio.play();
          return;
        }
      }
      fallbackBrowserSpeech(msg.content);
    } catch (e) {
      fallbackBrowserSpeech(msg.content);
    }
  };

  const fallbackBrowserSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const clean = text
        .replace(/[#*_`]/g, '')
        .replace(/🚨|💬|📋|🏥|⚠️/g, '')
        .slice(0, 400);
      const utterance = new SpeechSynthesisUtterance(clean);
      const targetLangCode = speechLocaleMap[language] || 'en-US';
      utterance.lang = targetLangCode;
      utterance.rate = 0.92;

      // Select matching browser voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        const foundVoice = voices.find(
          (v) =>
            v.lang.toLowerCase() === targetLangCode.toLowerCase() ||
            v.lang.toLowerCase().startsWith(targetLangCode.slice(0, 2).toLowerCase())
        );
        if (foundVoice) {
          utterance.voice = foundVoice;
        }
      } catch {}

      utterance.onend = () => setPlayingMessageId(null);
      utterance.onerror = () => setPlayingMessageId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingMessageId(null);
    }
  };

  const checkOfflineTriage = (query: string): string | null => {
    const q = query.toLowerCase();
    for (const rule of EMERGENCY_RED_FLAGS) {
      for (const s of rule.symptoms) {
        const words = s.toLowerCase().split(' ');
        const matches = words.filter((w) => w.length > 3 && q.includes(w));
        if (matches.length >= 2) {
          return `🚨 **CRITICAL WARNING / RED FLAG: IMMEDIATE EMERGENCY CARE REQUIRED**\n\n**${rule.name}**\n\n💬 **Direct Answer & Guidance:**\n${rule.immediateGuidance}\n\n📋 **Action Checklist:**\n- Lie comfortably on your left side while transport is arranged\n- Do not take local concoctions, aspirin, or unprescribed medicines\n- Call your designated emergency transport driver or hospital\n\n🏥 **When to See a Healthcare Provider:**\nGo to your nearest hospital or health center immediately.\n\n⚠️ *Disclaimer: Mama-G provides educational triage and does not replace emergency in-person medical care.*`;
        }
      }
    }
    return null;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const content = data.text || 'I could not generate an answer. Please seek medical guidance.';

      // Determine severity from text markers
      let severity: TriageSeverity = 'ROUTINE';
      if (content.includes('🚨') || content.toUpperCase().includes('EMERGENCY') || content.toUpperCase().includes('RED FLAG')) {
        severity = 'EMERGENCY';
      } else if (content.includes('⚠️') || content.toUpperCase().includes('URGENT')) {
        severity = 'URGENT';
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: Date.now(),
        severity,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Network request failed, running offline clinical rule engine fallback:', err);
      const offlineReply = checkOfflineTriage(prompt) || `💬 **Mama-G Offline Support:**\n\nYou are currently browsing offline. For pregnancy, please continue daily iron/folic acid, drink plenty of safe water, and sleep under a treated net.\n\nIf you have any severe symptoms (vaginal bleeding, severe headache with blurred vision, high fever, or baby not kicking), go directly to your nearest health centre.`;

      const assistantMsg: ChatMessage = {
        id: `asst-offline-${Date.now()}`,
        role: 'assistant',
        content: offlineReply,
        timestamp: Date.now(),
        severity: offlineReply.includes('🚨') ? 'EMERGENCY' : 'ROUTINE',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: t.quickPrompt1Label,
      desc: t.quickPrompt1Desc,
      text: t.quickPrompt1Text,
    },
    {
      label: t.quickPrompt2Label,
      desc: t.quickPrompt2Desc,
      text: t.quickPrompt2Text,
    },
    {
      label: t.quickPrompt3Label,
      desc: t.quickPrompt3Desc,
      text: t.quickPrompt3Text,
    },
    {
      label: t.quickPrompt4Label,
      desc: t.quickPrompt4Desc,
      text: t.quickPrompt4Text,
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-6.5rem)] max-w-6xl mx-auto px-2 sm:px-4 py-3">
      {/* Top Profile / User Context Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 mb-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/src/assets/images/mama_g_portrait_1792645422205.jpg"
              alt="Mama-G Mentor"
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-sm"
              onError={(e) => {
                // Fallback avatar container
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-stone-900 absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-100 text-sm sm:text-base">
                Mama-G Health Mentor
              </span>
              <span className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                Clinical AI Digital Midwife
              </span>
            </div>
            <p className="text-stone-400 text-xs mt-0.5">
              Empathetic · Evidence-Based WHO Guidelines · Confidential
            </p>
          </div>
        </div>

        {/* User Context Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-stone-800">
          <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={userContext.role}
              onChange={(e) =>
                setUserContext((prev) => ({
                  ...prev,
                  role: e.target.value as any,
                }))
              }
              className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="mother" className="bg-stone-800">Expectant Mother</option>
              <option value="postpartum" className="bg-stone-800">New Mother (Postpartum)</option>
              <option value="menopause" className="bg-stone-800">Menopause / Midlife Health</option>
              <option value="adolescent" className="bg-stone-800">Adolescent / Young Girl</option>
              <option value="chw" className="bg-stone-800">Community Health Worker (CHW)</option>
            </select>
          </div>

          {/* Interactive Live Voice Call Trigger Button */}
          <button
            type="button"
            onClick={() => setIsLiveCallOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-md shadow-emerald-950/40 transition-all cursor-pointer animate-pulse"
            title="Start Live Continuous Voice Call with Mama-G"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t.liveVoiceCall}</span>
          </button>

          {/* 774 LGA Health Directory Quick Access */}
          {onOpenFacilities && (
            <button
              type="button"
              onClick={onOpenFacilities}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg border border-stone-700 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
              title="Browse verified Primary Health Centers and Hospitals across all 774 LGAs"
            >
              <span>🏥 774 LGA Clinics</span>
            </button>
          )}

          {userContext.role === 'mother' && (
            <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700">
              <span className="text-stone-400">Week:</span>
              <select
                value={userContext.weeks || 20}
                onChange={(e) =>
                  setUserContext((prev) => {
                    const w = Number(e.target.value);
                    const t = w <= 12 ? 1 : w <= 26 ? 2 : 3;
                    return { ...prev, weeks: w, trimester: t as any };
                  })
                }
                className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 42 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w} className="bg-stone-800">
                    Week {w} (Trimester {w <= 12 ? 1 : w <= 26 ? 2 : 3})
                  </option>
                ))}
              </select>
            </div>
          )}

          {userContext.weeks && userContext.weeks >= 26 && (
            <button
              onClick={onOpenKickCounter}
              className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
            >
              <Baby className="w-3.5 h-3.5" />
              <span>Kick Counter</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isEmergency = msg.severity === 'EMERGENCY';
          const isUrgent = msg.severity === 'URGENT';
          const isPlaying = playingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-sm text-sm ${
                  isUser
                    ? 'bg-amber-600 text-white rounded-br-xs'
                    : isEmergency
                    ? 'bg-stone-900 border-2 border-rose-600 text-stone-100 rounded-bl-xs'
                    : isUrgent
                    ? 'bg-stone-900 border-2 border-amber-500/80 text-stone-100 rounded-bl-xs'
                    : 'bg-stone-900 border border-stone-800 text-stone-100 rounded-bl-xs'
                }`}
              >
                {/* Emergency Banner Header on Alert Messages */}
                {!isUser && isEmergency && (
                  <div className="bg-rose-600 text-white px-3 py-2 rounded-lg text-xs font-bold mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-bounce" />
                      CRITICAL EMERGENCY: IMMEDIATE MEDICAL ATTENTION REQUIRED
                    </span>
                    <button
                      onClick={onOpenEmergency}
                      className="underline hover:text-rose-100 text-xs shrink-0 ml-2"
                    >
                      View SOS Guide
                    </button>
                  </div>
                )}

                {/* Content formatted */}
                <div className="prose prose-invert prose-sm max-w-none space-y-2 leading-relaxed">
                  {msg.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('###')) {
                      return (
                        <h4 key={idx} className="text-base font-bold text-amber-300 mt-2 mb-1">
                          {paragraph.replace('###', '').trim()}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('🚨') || paragraph.includes('Immediate Safety Check')) {
                      return (
                        <div
                          key={idx}
                          className="bg-rose-950/80 border border-rose-500/50 text-rose-200 p-3 rounded-xl my-2 text-xs"
                        >
                          {paragraph}
                        </div>
                      );
                    }
                    if (paragraph.startsWith('💬') || paragraph.includes('Direct Answer')) {
                      return (
                        <div key={idx} className="text-stone-200">
                          {paragraph}
                        </div>
                      );
                    }
                    if (paragraph.startsWith('📋') || paragraph.includes('Practical Steps')) {
                      return (
                        <div key={idx} className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/60 my-2 text-stone-200">
                          {paragraph}
                        </div>
                      );
                    }
                    if (paragraph.startsWith('🏥') || paragraph.includes('When to See a Healthcare Provider')) {
                      return (
                        <div key={idx} className="bg-amber-950/50 border border-amber-500/40 text-amber-200 p-3 rounded-xl my-2 text-xs">
                          {paragraph}
                        </div>
                      );
                    }
                    return (
                      <p key={idx} className="text-stone-200 whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {/* Assistant Message Actions (TTS Audio Read-Aloud) */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                    <span className="text-[11px]">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <button
                      onClick={() => handlePlayAudio(msg)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                        isPlaying
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                      }`}
                      title={isPlaying ? t.stopAudio : t.listenAudio}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>{t.stopAudio}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t.listenAudio}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 rounded-bl-xs text-xs text-stone-400 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Mama-G is consulting clinical guidelines and preparing guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Strip (Only if conversation is short) */}
      {messages.length <= 2 && (
        <div className="my-2">
          <div className="text-[11px] font-semibold text-stone-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.quickPromptsTitle}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickPrompts.slice(0, 4).map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.text)}
                className="bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 p-2.5 rounded-xl text-left transition-all text-xs group"
              >
                <span className="font-semibold text-stone-200 block group-hover:text-amber-300 truncate">
                  {qp.label}
                </span>
                <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                  {qp.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Voice Recording Status & Interim Preview */}
      {isListening && (
        <div className="mb-2 bg-rose-950/90 border border-rose-500/60 rounded-xl p-3 text-xs text-rose-200 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span>{t.speechListening}</span>
            </div>
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white font-semibold rounded-lg text-[11px] transition-colors"
            >
              {t.doneSpeaking}
            </button>
          </div>
          <p className="text-stone-300 italic text-xs min-h-[1.25rem]">
            {interimTranscript || input || 'Listening... Speak clearly into your device.'}
          </p>
        </div>
      )}

      {/* Speech Error Banner if permission denied */}
      {speechError && (
        <div className="mb-2 bg-amber-950/80 border border-amber-500/50 rounded-xl p-2.5 text-xs text-amber-200 flex items-center justify-between">
          <span>{speechError}</span>
          <button
            onClick={() => setSpeechError(null)}
            className="text-amber-400 hover:text-white font-bold ml-2 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-2 bg-stone-900 border border-stone-800 rounded-2xl p-2 sm:p-2.5 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isListening) {
              toggleSpeechRecognition();
            }
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Speech-to-text dictation button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Speak your question (Web Speech Voice Input)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice... Speak now...'
                : t.askPlaceholder
            }
            className="flex-1 bg-stone-800/80 text-stone-100 placeholder-stone-500 text-sm px-4 py-2.5 rounded-xl border border-stone-700/80 focus:outline-none focus:border-amber-500"
            disabled={isLoading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-colors shrink-0"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-stone-400 px-2 pt-2">
          <span>{t.confidentialNotice}</span>
          <span>{t.educationalDisclaimer}</span>
        </div>
      </div>

      {/* Interactive Seamless Live Voice Call Modal */}
      <LiveVoiceCallModal
        isOpen={isLiveCallOpen}
        onClose={() => setIsLiveCallOpen(false)}
        language={language}
        userContext={userContext}
        onAddMessages={(uMsg, aMsg) => setMessages((prev) => [...prev, uMsg, aMsg])}
        onOpenEmergency={onOpenEmergency}
      />
    </div>
  );
};
