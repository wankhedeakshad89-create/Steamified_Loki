import { useStore } from 'zustand';
import { store } from '../state/store.js';
import { MATERIALS } from '../sim/materials.js';

export default function Header() {
  const material = useStore(store, (s) => s.material);
  const role = useStore(store, (s) => s.role);
  const setMaterial = useStore(store, (s) => s.setMaterial);
  const setRole = useStore(store, (s) => s.setRole);
  const reset = useStore(store, (s) => s.reset);

  return (
    <header className="h-[48px] bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none text-xs font-medium text-slate-700">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-slate-900 tracking-tight">
          Compression Test
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500 font-mono text-xs">UTM-600</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Material Selector */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="material-select" className="text-slate-500 text-[11px]">Material:</label>
          <select
            id="material-select"
            value={material.id}
            onChange={(e) => setMaterial(MATERIALS[e.target.value])}
            className="h-8 px-2 bg-white border border-slate-200 rounded-[4px] text-xs text-slate-800 focus:outline-none focus:border-slate-400"
          >
            <option value="steel">Mild steel (ductile)</option>
            <option value="castIron">Grey cast iron (brittle)</option>
          </select>
        </div>

        {/* Role Toggle Segmented Control */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-500 text-[11px]">Role:</label>
          <div className="flex bg-slate-100 p-0.5 rounded-[4px] border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`h-7 px-2.5 rounded-[3px] text-xs transition-colors ${
                role === 'student'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('supervisor')}
              className={`h-7 px-2.5 rounded-[3px] text-xs transition-colors ${
                role === 'supervisor'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Supervisor
            </button>
          </div>
        </div>

        {/* Muted Badge */}
        <span className="px-2 py-1 text-[11px] bg-slate-100 text-slate-500 rounded-[4px] border border-slate-200 font-mono tracking-tight">
          Simulated data
        </span>

        {/* Reset Button */}
        <button
          type="button"
          onClick={reset}
          className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-[4px] hover:bg-slate-50 active:bg-slate-100 transition-colors"
        >
          Reset
        </button>
      </div>
    </header>
  );
}
