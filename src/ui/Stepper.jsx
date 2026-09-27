import { useStore } from 'zustand';
import { store } from '../state/store.js';
import { STEPS, canAdvance } from '../state/procedure.js';

const GUARD_DESCRIPTIONS = {
  CLEAN: 'Platens must be cleaned and verified free of debris.',
  MEASURE: 'Specimen diameter and length must be measured and validated.',
  CENTER: 'Specimen offset must be within 0.5 mm of platen center.',
  APPROACH: 'UTM crosshead must be in contact with specimen and load tared.',
  SAFETY: 'Supervisor must approve safety inspection with zero faults.',
  TEST: 'Apply load until specimen failure or strain limit is reached.',
  RECORD: 'All test data recorded and ready for export.',
};

export default function Stepper() {
  const state = useStore(store);
  const { stepIndex, advance } = state;
  const isAdvancable = canAdvance(state);
  const activeStep = STEPS[stepIndex];

  return (
    <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col justify-between h-full select-none">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 border-b border-slate-200 text-[11px] font-semibold tracking-wider text-slate-500 uppercase bg-slate-50">
          Procedure Steps
        </div>

        <div className="divide-y divide-slate-100">
          {STEPS.map((step, idx) => {
            const isActive = idx === stepIndex;
            const isDone = idx < stepIndex;
            const isLocked = idx > stepIndex;

            let badgeLabel = 'Locked';
            let badgeStyle = 'bg-slate-100 text-slate-400 border-slate-200';
            if (isDone) {
              badgeLabel = 'Done';
              badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            } else if (isActive) {
              badgeLabel = 'Active';
              badgeStyle = 'bg-slate-900 text-white border-slate-900 font-semibold';
            }

            return (
              <div
                key={step.id}
                className={`p-3 flex items-start justify-between text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-50/80 border-l-[2px] border-l-[#0f172a] pl-[10px]'
                    : 'border-l-[2px] border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 pr-1">
                  <span className={`font-mono text-[11px] pt-0.5 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`font-medium leading-tight ${isActive ? 'text-slate-900 font-semibold' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                    {step.title}
                  </span>
                </div>

                <span className={`text-[10px] px-1.5 py-0.5 rounded-[3px] border uppercase tracking-tight shrink-0 ${badgeStyle}`}>
                  {badgeLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Requirement Block */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Requirement
          </span>
          <p className="text-xs text-slate-600 leading-snug">
            {GUARD_DESCRIPTIONS[activeStep.id]}
          </p>
        </div>

        <button
          type="button"
          disabled={!isAdvancable}
          onClick={advance}
          className="h-8 w-full rounded-[4px] bg-[#0f172a] text-white text-xs font-medium border border-[#0f172a] hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-[#0f172a] disabled:cursor-not-allowed transition-all"
        >
          Continue
        </button>
      </div>
    </aside>
  );
}
