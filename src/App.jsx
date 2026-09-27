import Header from './ui/Header.jsx';
import Stepper from './ui/Stepper.jsx';
import CenterPanel from './ui/CenterPanel.jsx';
import LoadReadout from './ui/LoadReadout.jsx';
import DialGauge from './ui/DialGauge.jsx';
import StressStrainChart from './ui/StressStrainChart.jsx';

export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans text-slate-900 antialiased">
      {/* 48px Header */}
      <Header />

      {/* 3-Column Body Layout [260px | 1fr | 340px] */}
      <div className="flex-1 grid grid-cols-[260px_1fr_340px] min-h-0">
        {/* Left Panel: Stepper */}
        <Stepper />

        {/* Center Panel: Tab bar & content canvas */}
        <CenterPanel />

        {/* Right Panel: Instrument Rack */}
        <aside className="w-[340px] bg-white border-l border-slate-200 flex flex-col h-full min-h-0">
          <LoadReadout />
          <DialGauge />
          <StressStrainChart />
        </aside>
      </div>
    </div>
  );
}
