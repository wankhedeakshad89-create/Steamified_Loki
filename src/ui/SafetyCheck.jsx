import { useState } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function SafetyCheck() {
  const role = useStore(store, (s) => s.role);
  const platensClean = useStore(store, (s) => s.platensClean);
  const isCentered = useStore(store, (s) => (s.specimen.offsetMm ?? 0) <= 0.5);
  const isTared = useStore(store, (s) => s.utm.tared);
  const safety = useStore(store, (s) => s.safety);
  const approveSafety = useStore(store, (s) => s.approveSafety);

  const [guardClosed, setGuardClosed] = useState(false);

  const allChecklistItemsChecked = guardClosed && isCentered && platensClean && isTared;
  const canApprove = role === 'supervisor' && allChecklistItemsChecked && (safety?.faults?.length ?? 0) === 0;

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 select-none overflow-y-auto">
      <div className="max-w-md w-full bg-slate-50 border border-slate-200 rounded-[4px] p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">Step 5: Supervisor Safety Sign-off</h3>
          <span className={`text-xs px-2 py-0.5 rounded font-mono uppercase ${role === 'supervisor' ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'bg-slate-200 text-slate-600'}`}>
            Role: {role}
          </span>
        </div>

        {role === 'student' ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-[4px] text-xs text-amber-900 leading-relaxed flex flex-col gap-2">
            <span className="font-semibold text-amber-950">Awaiting Supervisor Sign-off</span>
            <p>
              Students cannot approve safety checks. Please ask your lab supervisor to inspect the machine setup and switch their role to <strong>Supervisor</strong> in the header control to sign off.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Pre-Test Safety Inspection Checklist:
            </span>

            <div className="flex flex-col gap-2 text-xs">
              {/* Manual Checkbox: Safety Guard */}
              <label className="flex items-center gap-2.5 p-2 bg-white border border-slate-200 rounded-[4px] cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={guardClosed}
                  onChange={(e) => setGuardClosed(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
                <span className="font-medium text-slate-900">Machine safety guard closed & locked</span>
              </label>

              {/* Auto-checked: Specimen Centered */}
              <label className="flex items-center gap-2.5 p-2 bg-slate-100 border border-slate-200 rounded-[4px] opacity-90 cursor-not-allowed">
                <input type="checkbox" checked={isCentered} disabled className="w-4 h-4 accent-emerald-600" />
                <span className="text-slate-700">Specimen centered (Step 3: offset ≤ 0.5 mm)</span>
              </label>

              {/* Auto-checked: Platens Cleaned */}
              <label className="flex items-center gap-2.5 p-2 bg-slate-100 border border-slate-200 rounded-[4px] opacity-90 cursor-not-allowed">
                <input type="checkbox" checked={platensClean} disabled className="w-4 h-4 accent-emerald-600" />
                <span className="text-slate-700">Platens cleaned & verified free of debris (Step 1)</span>
              </label>

              {/* Auto-checked: Load Cell Tared */}
              <label className="flex items-center gap-2.5 p-2 bg-slate-100 border border-slate-200 rounded-[4px] opacity-90 cursor-not-allowed">
                <input type="checkbox" checked={isTared} disabled className="w-4 h-4 accent-emerald-600" />
                <span className="text-slate-700">Load cell tared & zeroed in contact (Step 4)</span>
              </label>

              {/* Auto-checked: E-Stop Released */}
              <label className="flex items-center gap-2.5 p-2 bg-slate-100 border border-slate-200 rounded-[4px] opacity-90 cursor-not-allowed">
                <input type="checkbox" checked={true} disabled className="w-4 h-4 accent-emerald-600" />
                <span className="text-slate-700">Emergency stop button released</span>
              </label>
            </div>

            {/* Approval Action Button */}
            <button
              type="button"
              onClick={approveSafety}
              disabled={!canApprove || safety?.approved}
              className={`h-10 w-full mt-2 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                safety?.approved
                  ? 'bg-emerald-600 text-white border border-emerald-600'
                  : 'bg-[#0f172a] text-white border border-[#0f172a] hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {safety?.approved ? '✓ Safety Inspection Approved' : 'Approve Test'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
