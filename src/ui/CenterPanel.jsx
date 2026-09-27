import { useState, useEffect } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';
import Scene from '../three/Scene.jsx';
import JogControls from '../three/JogControls.jsx';
import Controls from './Controls.jsx';

export default function CenterPanel() {
  const stepIndex = useStore(store, (s) => s.stepIndex);
  const [activeTab, setActiveTab] = useState('3D View');

  // Auto-switch tab based on procedure step
  useEffect(() => {
    if (stepIndex === 1) { // MEASURE step (0-indexed: 1 = MEASURE)
      setActiveTab('Caliper');
    } else {
      setActiveTab('3D View');
    }
  }, [stepIndex]);

  const tabs = ['3D View', 'Caliper', 'Notebook'];

  return (
    <main className="flex-1 bg-slate-50 flex flex-col min-w-0 h-full select-none">
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

      {/* Main Content Box */}
      <div className="flex-1 p-3 flex flex-col min-h-0 gap-2">
        <div className="w-full flex-1 bg-white border border-slate-200 rounded-[4px] relative overflow-hidden flex flex-col min-h-0">
          {activeTab === '3D View' && (
            <div className="w-full h-full relative overflow-hidden">
              <Scene />
              <JogControls />
            </div>
          )}

          {activeTab === 'Caliper' && (
            <div className="w-full h-full flex items-center justify-center p-6 text-center text-slate-400 font-mono text-sm">
              Digital Caliper Measurement Station Placeholder
            </div>
          )}

          {activeTab === 'Notebook' && (
            <div className="w-full h-full flex items-center justify-center p-6 text-center text-slate-400 font-mono text-sm">
              Lab Notebook & Data Export Placeholder
            </div>
          )}
        </div>

        {/* Machine Controls Strip */}
        <Controls />
      </div>
    </main>
  );
}
