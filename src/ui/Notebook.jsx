import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function Notebook() {
  const material = useStore(store, (s) => s.material);
  const measure = useStore(store, (s) => s.measure);
  const test = useStore(store, (s) => s.test);

  const records = test?.records || [];
  const peakLoad = test?.peakLoad || Math.max(0, ...records.map((r) => r.loadkN));
  const maxStress = Math.max(0, ...records.map((r) => r.sigmaEng));
  const maxStrain = test?.e ?? (records.length > 0 ? records[records.length - 1].strain : 0);

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Time (s)', 'Deflection (mm)', 'Load (kN)', 'Engineering Stress (MPa)', 'Engineering Strain'];
    const rows = records.map((r) => [
      r.t.toFixed(3),
      r.deltaL.toFixed(4),
      r.loadkN.toFixed(3),
      r.sigmaEng.toFixed(2),
      r.strain.toFixed(4),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `compression_test_${material.id}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col p-4 select-none overflow-y-auto font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Lab Notebook & Data Export</h3>
          <p className="text-xs text-slate-500">Uniaxial Compression Test Summary Report</p>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          disabled={records.length === 0}
          className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold rounded-[4px] border border-[#0f172a] hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs font-mono">
        {/* Specimen & Material Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-[4px] p-3 flex flex-col gap-2">
          <span className="font-sans font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            Specimen Parameters
          </span>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500">Material:</span>
            <span className="font-bold text-slate-900">{material.label}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500">Elastic Modulus (E):</span>
            <span className="font-semibold text-slate-800">{(material.E / 1000).toFixed(0)} GPa</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500">Measured Diameter (d₀):</span>
            <span className="font-semibold text-slate-800">{measure.d0Mean.toFixed(2)} mm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Measured Length (L₀):</span>
            <span className="font-semibold text-slate-800">{measure.L0Mean.toFixed(2)} mm</span>
          </div>
        </div>

        {/* Test Summary Results */}
        <div className="bg-slate-50 border border-slate-200 rounded-[4px] p-3 flex flex-col gap-2">
          <span className="font-sans font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            Test Results
          </span>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500">Peak Load (F_max):</span>
            <span className="font-bold text-emerald-600">{peakLoad.toFixed(2)} kN</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500">Max Eng. Stress (σ_eng):</span>
            <span className="font-bold text-emerald-600">{maxStress.toFixed(1)} MPa</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500">Final Eng. Strain (ε):</span>
            <span className="font-semibold text-slate-800">{maxStrain.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Test Status:</span>
            <span className="font-semibold text-indigo-600 uppercase">{test?.status}</span>
          </div>
        </div>
      </div>

      {/* Recorded Data Points Table */}
      <div className="flex-1 bg-white border border-slate-200 rounded-[4px] overflow-hidden flex flex-col min-h-0">
        <div className="bg-slate-50 border-b border-slate-200 p-2 px-3 text-[11px] font-sans font-semibold text-slate-500 uppercase flex justify-between items-center">
          <span>Recorded Data Points ({records.length} samples)</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[11px] text-slate-600 font-sans">
              <tr>
                <th className="p-1.5 pl-3">t (s)</th>
                <th className="p-1.5">ΔL (mm)</th>
                <th className="p-1.5">Load (kN)</th>
                <th className="p-1.5">σ_eng (MPa)</th>
                <th className="p-1.5 pr-3">Strain (ε)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-400 font-sans italic">
                    No data recorded yet. Run compression test in Step 6 to record data points.
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-1.5 pl-3">{r.t.toFixed(3)}</td>
                    <td className="p-1.5">{r.deltaL.toFixed(3)}</td>
                    <td className="p-1.5 font-semibold text-slate-900">{r.loadkN.toFixed(2)}</td>
                    <td className="p-1.5 text-emerald-700 font-semibold">{r.sigmaEng.toFixed(1)}</td>
                    <td className="p-1.5 pr-3">{r.strain.toFixed(4)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
