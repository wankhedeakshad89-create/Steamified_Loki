import { useRef, useEffect } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function CleanPlatens() {
  const cleanProgress = useStore(store, (s) => s.cleanProgress ?? 0);
  const platensClean = useStore(store, (s) => s.platensClean ?? false);
  const setCleanProgress = useStore(store, (s) => s.setCleanProgress);

  const isScrubbingRef = useRef(false);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  const updateScrub = () => {
    if (!isScrubbingRef.current) return;
    const now = performance.now();
    if (lastTimeRef.current !== null) {
      const dt = (now - lastTimeRef.current) / 1000;
      const currentProgress = store.getState().cleanProgress ?? 0;
      const nextProgress = Math.min(1.0, currentProgress + dt / 3.0); // 3 seconds to complete
      setCleanProgress(nextProgress);
    }
    lastTimeRef.current = now;
    if (store.getState().cleanProgress < 1.0) {
      animFrameRef.current = requestAnimationFrame(updateScrub);
    }
  };

  const startScrub = () => {
    if (platensClean) return;
    isScrubbingRef.current = true;
    lastTimeRef.current = performance.now();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(updateScrub);
  };

  const stopScrub = () => {
    isScrubbingRef.current = false;
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

  const progressPercent = Math.round(cleanProgress * 100);

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-md w-full bg-slate-50 border border-slate-200 rounded-[4px] p-6 flex flex-col items-center gap-4 text-center shadow-xs">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-slate-900">Step 1: Clean Compression Platens</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Press and hold the scrub button below for 3 seconds to wipe debris and oil from top and bottom platens.
          </p>
        </div>

        {/* Scrub Button */}
        <button
          type="button"
          onMouseDown={startScrub}
          onMouseUp={stopScrub}
          onMouseLeave={stopScrub}
          onTouchStart={startScrub}
          onTouchEnd={stopScrub}
          disabled={platensClean}
          className={`h-12 w-48 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all select-none cursor-pointer ${
            platensClean
              ? 'bg-emerald-600 text-white cursor-default border border-emerald-600'
              : 'bg-[#0f172a] text-white border border-[#0f172a] hover:bg-slate-800 active:scale-98'
          }`}
        >
          {platensClean ? '✓ Platens Clean' : 'Hold to Scrub'}
        </button>

        {/* 1px Progress Bar */}
        <div className="w-full flex flex-col gap-1.5 mt-2">
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>Cleanliness: {progressPercent}%</span>
            <span>{platensClean ? 'Ready to Proceed' : 'Requires 100%'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
