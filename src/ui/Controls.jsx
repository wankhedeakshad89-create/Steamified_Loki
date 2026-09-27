import { useStore } from 'zustand';
import { store } from '../state/store.js';

const TEST_RATES = [
  { label: 'Slow (0.02 mm/s)', value: 0.02 },
  { label: 'Medium (0.1 mm/s)', value: 0.1 },
  { label: 'Fast (0.5 mm/s)', value: 0.5 },
];

export default function Controls() {
  const test = useStore(store, (s) => s.test);
  const utm = useStore(store, (s) => s.utm);
  const material = useStore(store, (s) => s.material);
  const startTest = useStore(store, (s) => s.startTest);
  const stopTest = useStore(store, (s) => s.stopTest);
  const emergencyStop = useStore(store, (s) => s.emergencyStop);
  const setTestRate = useStore(store, (s) => s.setTestRate);
  const tareUTM = useStore(store, (s) => s.tareUTM);

  const isRunning = test?.status === 'running';
  const isFinished = ['failed', 'limit'].includes(test?.status);
  const inContact = utm?.inContact ?? false;

  // Permit Start Test to run once utm.inContact is true (temporary testing behavior)
  const canStart = inContact && test?.status === 'idle';
  const currentRate = test?.rate ?? (material?.brittle ? 0.02 : 0.5);

  return (
    <div className="bg-white border-t border-slate-200 p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Test Rate Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Test Speed:</span>
        <div className="flex bg-slate-100 p-0.5 rounded-[4px] border border-slate-200">
          {TEST_RATES.map((rateObj) => (
            <button
              key={rateObj.value}
              type="button"
              disabled={isRunning}
              onClick={() => setTestRate(rateObj.value)}
              className={`h-7 px-2.5 text-xs rounded-[3px] font-mono transition-colors ${
                Math.abs(currentRate - rateObj.value) < 1e-4
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              } disabled:opacity-50`}
            >
              {rateObj.label.split(' ')[0]} ({rateObj.value} mm/s)
            </button>
          ))}
        </div>
      </div>

      {/* Main Machine Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Tare Button */}
        <button
          type="button"
          onClick={tareUTM}
          disabled={utm?.tared}
          className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-[4px] hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 cursor-pointer"
        >
          {utm?.tared ? '✓ Load Tared' : 'Tare Load'}
        </button>

        {/* Start Test */}
        {!isRunning ? (
          <button
            type="button"
            onClick={() => startTest(currentRate)}
            disabled={!canStart || isFinished}
            className="h-8 px-4 text-xs font-semibold text-white bg-[#0f172a] border border-[#0f172a] rounded-[4px] hover:bg-slate-800 active:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
          >
            Start Test
          </button>
        ) : (
          /* Pause/Stop Test */
          <button
            type="button"
            onClick={stopTest}
            className="h-8 px-4 text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 rounded-[4px] hover:bg-amber-200 active:bg-amber-300 cursor-pointer"
          >
            Pause Test
          </button>
        )}

        {/* Emergency Stop Button */}
        <button
          type="button"
          onClick={emergencyStop}
          className="h-8 px-3 text-xs font-bold text-red-700 bg-red-50 border border-red-700 rounded-[4px] hover:bg-red-100 active:bg-red-200 cursor-pointer"
        >
          E-STOP
        </button>
      </div>
    </div>
  );
}
