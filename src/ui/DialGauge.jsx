import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function DialGauge() {
  const headTravel = useStore(store, (s) => s.test?.headTravel ?? s.utm?.headTravel ?? 0);
  const deltaL = useStore(store, (s) => s.test?.deltaL ?? 0);

  return (
    <div className="bg-white border-b border-slate-200 flex flex-col select-none">
      <div className="h-[32px] px-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        <span>Crosshead Displacement</span>
        <span className="font-mono text-[10px] text-slate-400">mm</span>
      </div>

      <div className="p-4 flex flex-col gap-2 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Head Travel:</span>
          <span className="font-mono text-sm font-semibold text-slate-900">
            {headTravel.toFixed(3)} <span className="text-xs text-slate-400 font-normal">mm</span>
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
          <span className="text-xs text-slate-500 font-medium">Specimen Deflection (ΔL):</span>
          <span className="font-mono text-sm font-semibold text-indigo-600">
            {deltaL.toFixed(3)} <span className="text-xs text-slate-400 font-normal">mm</span>
          </span>
        </div>
      </div>
    </div>
  );
}
