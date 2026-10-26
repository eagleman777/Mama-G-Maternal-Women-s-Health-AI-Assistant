import React, { useState, useEffect } from 'react';
import { X, Play, RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface KickCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmergencyTrigger?: () => void;
}

export const KickCounterModal: React.FC<KickCounterModalProps> = ({
  isOpen,
  onClose,
  onEmergencyTrigger,
}) => {
  const [kicks, setKicks] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [history, setHistory] = useState<{ time: string; kickCount: number }[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  if (!isOpen) return null;

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleKick = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
    const newCount = kicks + 1;
    setKicks(newCount);
    if (newCount === 10) {
      setIsRunning(false);
      setHistory((prev) => [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          kickCount: 10,
        },
        ...prev,
      ]);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setKicks(0);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowCountWarning = seconds >= 3600 && kicks < 4; // over an hour with under 4 kicks
  const isGoalReached = kicks >= 10;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
            3rd Trimester Fetal Wellness
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Baby Kick Counter (Count the Kicks)
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Lie comfortably on your left side. Feel for kicks, swishes, and rolls. Your goal is 10 movements in under 2 hours.
          </p>
        </div>

        {/* Counter Display */}
        <div className="flex flex-col items-center justify-center bg-stone-800/80 border border-stone-700 rounded-2xl p-6 mb-6">
          <div className="text-6xl font-black text-amber-400 font-mono tracking-tight tabular-nums">
            {kicks}
          </div>
          <span className="text-xs text-stone-400 uppercase tracking-widest mt-1">
            Movements Logged / 10 Goal
          </span>

          {/* Timer Display */}
          <div className="flex items-center gap-1.5 mt-3 text-stone-300 font-mono text-sm bg-stone-900/60 px-3 py-1 rounded-full border border-stone-700/60">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Time Elapsed: {formatTime(seconds)}</span>
          </div>

          {/* Goal reached banner */}
          {isGoalReached && (
            <div className="mt-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Great job! Your baby reached 10 active kicks in {formatTime(seconds)}. Fetal activity looks healthy.</span>
            </div>
          )}

          {/* Warning banner if prolonged silence */}
          {isLowCountWarning && !isGoalReached && (
            <div className="mt-4 bg-rose-950/90 border border-rose-500/50 text-rose-200 px-4 py-2 rounded-xl text-xs flex items-start gap-2 text-left">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-rose-300">Decreased Fetal Movement Alert</span>
                Over 1 hour has passed with few kicks. Drink a glass of cold water or sweet juice, lie flat on your left side, and focus for 30 more minutes. If baby remains still, visit your clinic today.
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          <button
            onClick={handleKick}
            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base transition-all active:scale-98 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <span>+ Tap for Baby Kick / Movement</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={isRunning ? () => setIsRunning(false) : handleStart}
              className="py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
            >
              {isRunning ? 'Pause Timer' : 'Resume Timer'}
            </button>
            <button
              onClick={handleReset}
              className="py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Counter</span>
            </button>
          </div>
        </div>

        {/* Clinical Note */}
        <div className="mt-6 pt-4 border-t border-stone-800 text-[11px] text-stone-400 leading-relaxed">
          <strong>Midwife Tip:</strong> Healthy babies move throughout the day and night. If your baby moves significantly less than normal, do not wait for your next scheduled appointment. Seek fetal heart tone monitoring at your health facility.
        </div>
      </div>
    </div>
  );
};
