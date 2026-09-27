import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';

const SPEEDS = {
  fine: { label: 'Fine (0.05 mm/s)', value: 0.05 },
  medium: { label: 'Medium (0.5 mm/s)', value: 0.5 },
  fast: { label: 'Fast (2.0 mm/s)', value: 2.0 },
};

export default function JogControls() {
  const headTravel = useStore(store, (s) => s.utm.headTravel ?? 0);
  const contactTravel = useStore(store, (s) => s.utm.contactTravel ?? 40.0);
  const inContact = useStore(store, (s) => s.utm.inContact ?? false);
  const tared = useStore(store, (s) => s.utm.tared ?? false);
  const stepIndex = useStore(store, (s) => s.stepIndex);
  const setHeadTravel = useStore(store, (s) => s.setHeadTravel);
  const tareUTM = useStore(store, (s) => s.tareUTM);

  const [speedKey, setSpeedKey] = useState('medium');
  const speed = SPEEDS[speedKey].value;

  const jogDirectionRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  const isApproachStep = stepIndex === 3; // Step 3 (0-indexed) = APPROACH

  const updateJog = useCallback(() => {
    if (jogDirectionRef.current === 0) return;

    const now = performance.now();
    if (lastTimeRef.current !== null) {
      const dt = (now - lastTimeRef.current) / 1000;
      const currentTravel = store.getState().utm.headTravel ?? 0;
      const nextTravel = currentTravel + jogDirectionRef.current * speed * dt;
      setHeadTravel(nextTravel);
    }
    lastTimeRef.current = now;
    animFrameRef.current = requestAnimationFrame(updateJog);
  }, [speed, setHeadTravel]);

  const startJog = (dir) => {
    if (!isApproachStep) return;
    jogDirectionRef.current = dir;
    lastTimeRef.current = performance.now();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(updateJog);
  };

  const stopJog = () => {
    jogDirectionRef.current = 0;
    lastTimeRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const jogDisabledTooltip = !isApproachStep ? 'Jog controls active ONLY during Step 4 (APPROACH)' : '';

  return (
    <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-[4px] p-2 flex flex-wrap items-center justify-between gap-2 shadow-xs text-xs select-none z-10">
      {/* Speed Selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Speed:</span>
        <div className="flex bg-slate-100 p-0.5 rounded-[3px] border border-slate-200">
          {Object.entries(SPEEDS).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSpeedKey(key)}
              disabled={!isApproachStep}
              title={jogDisabledTooltip || `Set jog speed to ${cfg.label}`}
              className={`h-6 px-2 text-[11px] rounded-[2px] transition-colors font-mono ${
                speedKey === key
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Hold Jog Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onMouseDown={() => startJog(-1)}
          onMouseUp={stopJog}
          onMouseLeave={stopJog}
          onTouchStart={() => startJog(-1)}
          onTouchEnd={stopJog}
          disabled={!isApproachStep || headTravel <= 0}
          title={jogDisabledTooltip || (headTravel <= 0 ? 'Crosshead at upper limit' : 'Hold to jog crosshead up')}
          className="h-7 px-3 bg-white border border-slate-300 rounded-[4px] font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          ▲ Jog Up
        </button>

        <button
          type="button"
          onMouseDown={() => startJog(1)}
          onMouseUp={stopJog}
          onMouseLeave={stopJog}
          onTouchStart={() => startJog(1)}
          onTouchEnd={stopJog}
          disabled={!isApproachStep || headTravel >= contactTravel}
          title={jogDisabledTooltip || (headTravel >= contactTravel ? 'Platen in contact with specimen' : 'Hold to jog crosshead down')}
          className="h-7 px-3 bg-[#0f172a] text-white border border-[#0f172a] rounded-[4px] font-medium hover:bg-slate-800 active:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          ▼ Jog Down
        </button>

        {isApproachStep && inContact && !tared && (
          <button
            type="button"
            onClick={tareUTM}
            title="Zero load cell reading in contact"
            className="h-7 px-3 bg-amber-500 text-white border border-amber-600 rounded-[4px] font-semibold hover:bg-amber-600 active:bg-amber-700 animate-pulse cursor-pointer"
          >
            Tare Load
          </button>
        )}
      </div>

      {/* Distance Status */}
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="text-slate-500">Travel:</span>
        <span className="font-semibold text-slate-900">{headTravel.toFixed(2)} / {contactTravel.toFixed(2)} mm</span>
        {inContact ? (
          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
            IN CONTACT
          </span>
        ) : (
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">
            GAP: {((contactTravel - headTravel)).toFixed(2)} mm
          </span>
        )}
      </div>
    </div>
  );
}
