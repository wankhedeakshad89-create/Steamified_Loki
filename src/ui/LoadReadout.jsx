import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function LoadReadout() {
  const test = useStore(store, (s) => s.test);
  const loadkN = test?.loadkN ?? 0;
  const peakLoad = test?.peakLoad || Math.max(0, ...((test?.records || []).map(r => r.loadkN)));

  return (
    <div className="bg-white border-b border-slate-200 flex flex-col">
      <div className="h-[32px] px-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 uppercase select-none">
        <span>Load Cell (UTM-600)</span>
        <span className="font-mono text-[10px] text-slate-400">kN</span>
      </div>

      <div className="p-4 flex flex-col gap-1 items-end justify-center bg-slate-900 text-white font-mono select-none">
        <div className="text-3xl font-bold tracking-tight text-emerald-400">
          {loadkN.toFixed(2).padStart(6, '0')} <span className="text-sm font-normal text-slate-400">kN</span>
        </div>
        <div className="text-[11px] text-slate-400 tracking-wide">
          PEAK: <span className="text-slate-200 font-semibold">{peakLoad.toFixed(2).padStart(6, '0')} kN</span>
        </div>
      </div>
    </div>
  );
}
