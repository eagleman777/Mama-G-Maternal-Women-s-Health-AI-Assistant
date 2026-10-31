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
  Zap,
} from 'lucide-react';
import { SupportedLanguage, UserContext, ChatMessage, TriageSeverity } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { pcm16ToBase64, LiveAudioPlayer } from '../utils/audioStreamUtils';
import mamaGPortrait from '../assets/images/mama_g_portrait_1792645422205.jpg';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const liveAudioPlayerRef = useRef<LiveAudioPlayer | null>(null);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  // Initialize and tear down Live API WebSocket Session
  useEffect(() => {
    if (!isOpen) {
      cleanupAudioSession();
      return;
    }

    startLiveSession();

    return () => {
      cleanupAudioSession();
    };
  }, [isOpen]);

  const cleanupAudioSession = () => {
    try {
      processorRef.current?.disconnect();
      processorRef.current = null;

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      liveAudioPlayerRef.current?.close();
      liveAudioPlayerRef.current = null;

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setIsLiveConnected(false);
      setCallState('listening');
    } catch (err) {
      console.warn('Audio session cleanup error:', err);
    }
  };

  const startLiveSession = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    setLastMamaSpeech('');
    setCallState('listening');

    // 1. Initialize Player for 24kHz audio from gemini-3.8-live
    liveAudioPlayerRef.current = new LiveAudioPlayer(24000);
    liveAudioPlayerRef.current.init();

    // 2. Connect WebSocket to /live
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Live Voice] WebSocket connected to Gemini 3.8 Live API');
      setIsLiveConnected(true);
      startMicCapture(ws);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.error) {
          console.error('[Live Voice] Server error:', msg.error);
          setErrorMessage(msg.details || msg.error);
          return;
        }

        if (msg.interrupted) {
          liveAudioPlayerRef.current?.interrupt();
          setCallState('listening');
          return;
        }

        if (msg.audio) {
          setCallState('speaking');
          liveAudioPlayerRef.current?.playChunk(msg.audio);
        }

        if (msg.text) {
          setLastMamaSpeech((prev) => prev + msg.text);
          setCallState('speaking');
        }
      } catch (err) {
        console.warn('WS message parse error:', err);
      }
    };

    ws.onerror = (e) => {
      console.error('[Live Voice] WebSocket error:', e);
      setErrorMessage('Unable to connect to Mama-G Live voice channel. Please check network.');
    };

    ws.onclose = () => {
      setIsLiveConnected(false);
    };
  };

  const startMicCapture = async (activeWs: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // Buffer size 2048 or 4096 gives smooth 16kHz PCM streaming
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        if (activeWs.readyState !== WebSocket.OPEN) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);
        // Calculate volume level for UI
        let sum = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sum += inputChannelData[i] * inputChannelData[i];
        }
        const rms = Math.sqrt(sum / inputChannelData.length);
        if (rms > 0.02) {
          setCallState((current) => (current === 'speaking' ? current : 'listening'));
        }

        const base64Audio = pcm16ToBase64(inputChannelData);
        activeWs.send(JSON.stringify({ audio: base64Audio }));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone permission denied. Please allow microphone access in your browser to speak with Mama-G.');
      } else {
        setErrorMessage('Could not initialize microphone: ' + err.message);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      liveAudioPlayerRef.current?.interrupt();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-voice-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-amber-500/40 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center space-y-4 relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Title & Model badge */}
        <div className="w-full flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 id="live-voice-title" className="font-extrabold text-white text-sm sm:text-base tracking-tight flex items-center gap-1.5">
              <span>Mama-G Live Voice Call</span>
              <span className="text-xs">🌺</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>gemini-3.8-live</span>
            </span>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-200 text-xs px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Central Mama-G Avatar with Animated Sound Wave Aura */}
        <div className="relative my-2">
          {/* Pulsing Aura Rings depending on state */}
          <div
            className={`absolute -inset-4 rounded-full blur-xl transition-all duration-700 ${
              callState === 'listening'
                ? 'bg-emerald-500/30 animate-pulse'
                : callState === 'speaking'
                ? 'bg-rose-500/40 animate-ping'
                : 'bg-amber-500/25 animate-pulse'
            }`}
          />
          <div
            className={`absolute -inset-2 rounded-full border-2 transition-all duration-500 ${
              callState === 'listening'
                ? 'border-emerald-400/70 scale-105'
                : callState === 'speaking'
                ? 'border-rose-400/80 scale-110'
                : 'border-amber-400/50'
            }`}
          />

          <img
            src={mamaGPortrait}
            alt="Mama-G Mentor"
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-amber-500/80 shadow-2xl"
          />
        </div>

        {/* Status Headline & Waveform Equalizer */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all">
            {callState === 'listening' && (
              <span className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {t.mamaListening || 'Mama-G is listening to you...'}
              </span>
            )}
            {callState === 'thinking' && (
              <span className="text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                {t.mamaThinking || 'Thinking...'}
              </span>
            )}
            {callState === 'speaking' && (
              <span className="text-rose-300 bg-rose-500/15 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                {t.mamaSpeaking || 'Mama-G is speaking...'}
              </span>
            )}
          </div>

          {/* Equalizer waveform bars */}
          <div className="flex items-center justify-center gap-1.5 h-6">
            {[35, 75, 55, 90, 60, 80, 45].map((height, i) => (
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
              <span className="font-semibold text-emerald-400 block mb-1">Live Voice Channel:</span>
              <p className="italic text-stone-300">
                Speak freely into your microphone in {language}. Ask about your symptoms, pregnancy milestones, baby kicks, or nutrition...
              </p>
            </div>
          ) : (
            <div>
              <span className="font-semibold text-rose-400 block mb-1">Mama-G Live Audio:</span>
              <p className="text-stone-200 leading-relaxed">
                {lastMamaSpeech || 'Speaking live audio guidance...'}
              </p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="w-full p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 text-left">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Call Controls Bar */}
        <div className="w-full flex items-center justify-center gap-4 pt-2">
          {/* Mute / Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-md ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={onClose}
            className="h-12 px-6 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-950/60 transition-all cursor-pointer"
            title="End Voice Call"
            aria-label="End Voice Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>

          {/* Emergency SOS Shortcut */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEmergency();
            }}
            className="w-12 h-12 rounded-full bg-stone-800 hover:bg-rose-950/60 text-stone-300 hover:text-rose-300 border border-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Open Emergency SOS"
            aria-label="Emergency SOS"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </button>
        </div>

        {/* Footer info pill */}
        <div className="pt-1 text-[11px] text-stone-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-time voice powered by Gemini 3.8 Live API · Anonymous</span>
        </div>
      </div>
    </div>
  );
};
