import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function CenterSpecimen() {
  const xOffset = useStore(store, (s) => s.specimen.xOffset ?? 0);
  const zOffset = useStore(store, (s) => s.specimen.zOffset ?? 0);
  const offsetMm = useStore(store, (s) => s.specimen.offsetMm ?? 0);
  const nudgeSpecimen = useStore(store, (s) => s.nudgeSpecimen);

  const isCentered = offsetMm <= 0.5;

  // SVG Bullseye scaling: radius 4.0 mm = 90 px (so 1 mm = 22.5 px)
  const SCALE = 22.5;
  const CENTER = 110;

  const reticleX = CENTER + xOffset * SCALE;
  const reticleY = CENTER + zOffset * SCALE;

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-between p-4 select-none overflow-y-auto">
      {/* Step Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-[4px] p-2.5 w-full flex items-center justify-between text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-slate-900">Step 3: Center Specimen on Lower Platen</span>
          <span className="text-slate-500">Nudge specimen until radial offset is ≤ 0.5 mm from center.</span>
        </div>
        <div className="font-mono text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-[4px]">
          Offset: <span className={isCentered ? 'text-emerald-600' : 'text-amber-600'}>{offsetMm.toFixed(2)} mm</span>
        </div>
      </div>

      {/* 2D Bullseye SVG & Directional Pad */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 my-2">
        {/* SVG Concentric Bullseye */}
        <div className="relative bg-slate-900 rounded-[4px] border border-slate-800 p-2 shadow-xs">
          <svg width="220" height="220" viewBox="0 0 220 220">
            {/* Concentric Rings: 4.0mm, 2.0mm, 1.0mm, 0.5mm */}
            <circle cx={CENTER} cy={CENTER} r={4.0 * SCALE} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={CENTER} cy={CENTER} r={2.0 * SCALE} fill="none" stroke="#475569" strokeWidth="1" />
            <circle cx={CENTER} cy={CENTER} r={1.0 * SCALE} fill="none" stroke="#64748b" strokeWidth="1" />
            {/* Target 0.5mm Tolerance Zone (Green) */}
            <circle cx={CENTER} cy={CENTER} r={0.5 * SCALE} fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5" />

            {/* Crosshairs */}
            <line x1="20" y1={CENTER} x2="200" y2={CENTER} stroke="#475569" strokeWidth="0.8" />
            <line x1={CENTER} y1="20" x2={CENTER} y2="200" stroke="#475569" strokeWidth="0.8" />

            {/* Labels */}
            <text x={CENTER + 0.5 * SCALE + 2} y={CENTER - 4} fill="#10b981" fontSize="9" fontFamily="monospace">0.5mm</text>
            <text x={CENTER + 2.0 * SCALE + 2} y={CENTER - 4} fill="#64748b" fontSize="9" fontFamily="monospace">2.0mm</text>
            <text x={CENTER + 4.0 * SCALE - 14} y={CENTER - 4} fill="#475569" fontSize="9" fontFamily="monospace">4.0mm</text>

            {/* Specimen Reticle Dot */}
            <circle
              cx={reticleX}
              cy={reticleY}
              r="8"
              fill={isCentered ? '#10b981' : '#f59e0b'}
              fillOpacity="0.8"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle cx={reticleX} cy={reticleY} r="2" fill="#0f172a" />
          </svg>
        </div>

        {/* Directional Nudge Pad */}
        <div className="flex flex-col items-center gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-[4px]">
          <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Directional Controls</span>

          {/* Grid Directional Buttons */}
          <div className="grid grid-cols-3 gap-1.5 w-44">
            <div />
            <button
              type="button"
              onClick={() => nudgeSpecimen(0, -0.5)}
              className="h-8 bg-white border border-slate-300 rounded-[4px] font-semibold text-xs text-slate-800 hover:bg-slate-100 active:bg-slate-200"
            >
              ▲ -0.5
            </button>
            <div />

            <button
              type="button"
              onClick={() => nudgeSpecimen(-0.5, 0)}
              className="h-8 bg-white border border-slate-300 rounded-[4px] font-semibold text-xs text-slate-800 hover:bg-slate-100 active:bg-slate-200"
            >
              ◀ -0.5
            </button>
            <div className="h-8 flex items-center justify-center font-mono text-[10px] text-slate-400 font-bold">
              NUDGE
            </div>
            <button
              type="button"
              onClick={() => nudgeSpecimen(0.5, 0)}
              className="h-8 bg-white border border-slate-300 rounded-[4px] font-semibold text-xs text-slate-800 hover:bg-slate-100 active:bg-slate-200"
            >
              +0.5 ▶
            </button>

            <div />
            <button
              type="button"
              onClick={() => nudgeSpecimen(0, 0.5)}
              className="h-8 bg-white border border-slate-300 rounded-[4px] font-semibold text-xs text-slate-800 hover:bg-slate-100 active:bg-slate-200"
            >
              ▼ +0.5
            </button>
            <div />
          </div>

          {/* Fine Adjustment (±0.1 mm) */}
          <div className="flex items-center gap-1.5 border-t border-slate-200 pt-2 w-full justify-center">
            <span className="text-[10px] text-slate-400 font-medium uppercase">Fine (0.1mm):</span>
            <button
              type="button"
              onClick={() => nudgeSpecimen(-0.1, 0)}
              className="h-6 px-2 bg-white border border-slate-300 rounded-[3px] text-[11px] font-mono hover:bg-slate-100"
            >
              -X
            </button>
            <button
              type="button"
              onClick={() => nudgeSpecimen(0.1, 0)}
              className="h-6 px-2 bg-white border border-slate-300 rounded-[3px] text-[11px] font-mono hover:bg-slate-100"
            >
              +X
            </button>
            <button
              type="button"
              onClick={() => nudgeSpecimen(0, -0.1)}
              className="h-6 px-2 bg-white border border-slate-300 rounded-[3px] text-[11px] font-mono hover:bg-slate-100"
            >
              -Z
            </button>
            <button
              type="button"
              onClick={() => nudgeSpecimen(0, 0.1)}
              className="h-6 px-2 bg-white border border-slate-300 rounded-[3px] text-[11px] font-mono hover:bg-slate-100"
            >
              +Z
            </button>
          </div>
        </div>
      </div>

      {/* Validation Status Badge */}
      <div className="w-full flex items-center justify-center">
        {isCentered ? (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 rounded-[4px] text-xs">
            ✓ Specimen Centered (Offset: {offsetMm.toFixed(2)} mm ≤ 0.5 mm)
          </span>
        ) : (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-medium border border-amber-300 rounded-[4px] text-xs">
            Specimen misaligned (Offset: {offsetMm.toFixed(2)} mm &gt; 0.5 mm). Nudge towards center.
          </span>
        )}
      </div>
    </div>
  );
}
