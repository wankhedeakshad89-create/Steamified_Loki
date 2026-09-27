import { useState, useEffect } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';
import { MACHINE_CAPACITY_KN } from '../sim/constants.js';

export default function LoadReadout() {
  const test = useStore(store, (s) => s.test);
  const rawLoadkN = test?.loadkN ?? 0;
  const isRunning = test?.status === 'running';

  // Calculate peak load from test records
  const peakLoad = test?.peakLoad || Math.max(0, ...((test?.records || []).map((r) => r.loadkN)));

  // Add small noise (±0.02 kN) while running for visual realism
  const [displayLoad, setDisplayLoad] = useState(rawLoadkN);

  useEffect(() => {
    if (isRunning) {
      const noise = (Math.random() - 0.5) * 0.04;
      setDisplayLoad(Math.max(0, rawLoadkN + noise));
    } else {
      setDisplayLoad(rawLoadkN);
    }
  }, [rawLoadkN, isRunning]);

  const loadPercent = Math.min(100, (displayLoad / MACHINE_CAPACITY_KN) * 100);
  const isOverload = displayLoad > MACHINE_CAPACITY_KN;

  return (
    <div className="bg-white border-b border-slate-200 flex flex-col select-none">
      {/* Header */}
      <div className="h-[32px] px-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        <div className="flex items-center gap-1.5">
          <span>Load Cell (UTM-600)</span>
          {isOverload && (
            <span className="px-1.5 py-0.2 bg-red-100 text-red-700 font-bold text-[10px] rounded animate-bounce">
              OVERLOAD
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-slate-400">kN</span>
      </div>

      {/* Main Readout HUD */}
      <div className="p-3.5 flex flex-col gap-2.5 bg-slate-900 text-white font-mono">
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold tracking-tight text-emerald-400 tabular-nums">
            {displayLoad.toFixed(2).padStart(6, '0')} <span className="text-xs font-normal text-slate-400">kN</span>
          </div>

          <div className="text-[11px] text-slate-400 tracking-wide tabular-nums text-right">
            PEAK: <span className="text-slate-200 font-semibold">{peakLoad.toFixed(2).padStart(6, '0')} kN</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full flex flex-col gap-1">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                isOverload ? 'bg-red-500' : loadPercent > 80 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${loadPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 kN</span>
            <span>{Math.round(loadPercent)}% ({MACHINE_CAPACITY_KN} kN MAX)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
