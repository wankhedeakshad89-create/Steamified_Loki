export default function StressStrainChart() {
  return (
    <div className="bg-white flex-1 flex flex-col min-h-0 select-none">
      <div className="h-[32px] px-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        <span>Engineering Stress-Strain Curve</span>
        <span className="font-mono text-[10px] text-slate-400">σ - ε</span>
      </div>

      <div className="flex-1 p-3 flex flex-col min-h-0">
        <div className="w-full h-full bg-slate-50 border border-slate-200 border-dashed rounded-[4px] flex items-center justify-center p-4 text-center text-slate-400 font-mono text-xs">
          Stress-Strain Chart Container Placeholder
        </div>
      </div>
    </div>
  );
}
