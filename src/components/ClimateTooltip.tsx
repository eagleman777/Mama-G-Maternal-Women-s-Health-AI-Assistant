import React, { useState, useRef, useEffect, useId } from 'react';
import { Info, Volume2, X } from 'lucide-react';
import type { MamaGLocale } from '../i18n/climateTooltips';

export interface ClimateTooltipProps {
  label: string;
  detail: string;
  locale?: MamaGLocale;
  onSpeak?: (text: string) => void;
  className?: string;
}

export const ClimateTooltip: React.FC<ClimateTooltipProps> = ({
  label,
  detail,
  locale = 'en',
  onSpeak,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center ml-1.5 ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={`Maternal risk guidance: ${label}`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onFocus={() => setOpen(true)}
        className="w-6 h-6 rounded-full inline-flex items-center justify-center text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/15 focus:outline-none focus:ring-2 focus:ring-amber-400/70 transition-colors cursor-pointer"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          id={tooltipId}
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className="absolute z-40 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 rounded-xl bg-stone-950 border border-amber-500/50 shadow-2xl text-left space-y-1.5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs font-bold text-amber-300 leading-snug">
              {label}
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-stone-800 text-[10px] font-mono uppercase text-stone-300">
                {locale}
              </span>
            </div>
            <button
              type="button"
              aria-label="Close tooltip"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              className="text-stone-400 hover:text-white p-0.5 rounded cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-stone-200 leading-relaxed font-normal">{detail}</p>
          {onSpeak && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSpeak(`${label}. ${detail}`);
              }}
              className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/35 text-[11px] font-semibold cursor-pointer"
            >
              <Volume2 className="w-3 h-3" />
              <span>Play Guidance ({locale.toUpperCase()})</span>
            </button>
          )}
        </div>
      )}
    </span>
  );
};
