import { useState, useEffect } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';
import Scene from '../three/Scene.jsx';
import JogControls from '../three/JogControls.jsx';
import Vernier from './Vernier.jsx';
import CleanPlatens from './CleanPlatens.jsx';
import CenterSpecimen from './CenterSpecimen.jsx';
import SafetyCheck from './SafetyCheck.jsx';
import Notebook from './Notebook.jsx';
import Controls from './Controls.jsx';

export default function CenterPanel() {
  const stepIndex = useStore(store, (s) => s.stepIndex);
  const platensClean = useStore(store, (s) => s.platensClean);
  const offsetMm = useStore(store, (s) => s.specimen.offsetMm ?? 0);
  const safetyApproved = useStore(store, (s) => s.safety.approved);
  const [activeTab, setActiveTab] = useState('3D View');

  // Auto-switch tab based on procedure step
  useEffect(() => {
    if (stepIndex === 1) {
      setActiveTab('Caliper'); // Step 2: MEASURE
    } else if (stepIndex === 6) {
      setActiveTab('Notebook'); // Step 7: RECORD
    } else {
      setActiveTab('3D View');
    }
  }, [stepIndex]);

  const tabs = ['3D View', 'Caliper', 'Notebook'];

  return (
    <main className="flex-1 bg-slate-50 flex flex-col min-w-0 h-full min-h-0 overflow-hidden select-none">
      {/* Tab Bar */}
      <div className="h-[36px] bg-white border-b border-slate-200 px-3 flex items-center justify-between gap-1 shrink-0">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-7 px-3 text-xs font-medium rounded-[3px] transition-colors ${
                activeTab === tab
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Box with Scroll Container */}
      <div className="flex-1 p-3 flex flex-col min-h-0 gap-2 overflow-y-auto">
        <div className="w-full flex-1 bg-white border border-slate-200 rounded-[4px] relative flex flex-col min-h-0 overflow-y-auto">
          {activeTab === '3D View' && (
            <div className="w-full h-full relative overflow-hidden flex flex-col min-h-[400px]">
              {stepIndex === 0 && !platensClean ? (
                <CleanPlatens />
              ) : stepIndex === 2 && offsetMm > 0.5 ? (
                <CenterSpecimen />
              ) : stepIndex === 4 && !safetyApproved ? (
                <SafetyCheck />
              ) : (
                <div className="w-full h-full relative overflow-hidden">
                  <Scene />
                  <JogControls />
                </div>
              )}
            </div>
          )}

          {activeTab === 'Caliper' && (
            <div className="w-full h-full relative flex flex-col min-h-0 overflow-y-auto">
              <Vernier />
            </div>
          )}

          {activeTab === 'Notebook' && (
            <div className="w-full h-full relative flex flex-col min-h-0 overflow-y-auto">
              <Notebook />
            </div>
          )}
        </div>

        {/* Machine Controls Strip */}
        <Controls />
      </div>
    </main>
  );
}
