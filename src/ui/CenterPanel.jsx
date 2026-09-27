import { useState, useEffect } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';

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
      <div className="h-[36px] bg-white border-b border-slate-200 px-3 flex items-center gap-1">
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

      {/* Main Content Box */}
      <div className="flex-1 p-4 flex items-center justify-center min-h-0">
        <div className="w-full h-full bg-white border border-slate-200 rounded-[4px] flex items-center justify-center p-6 text-center text-slate-400 font-mono text-sm shadow-xs">
          {activeTab === '3D View' && '3D View Canvas Placeholder'}
          {activeTab === 'Caliper' && 'Digital Caliper Measurement Station Placeholder'}
          {activeTab === 'Notebook' && 'Lab Notebook & Data Export Placeholder'}
        </div>
      </div>
    </main>
  );
}
