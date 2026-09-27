import Header from './ui/Header.jsx';
import Stepper from './ui/Stepper.jsx';
import CenterPanel from './ui/CenterPanel.jsx';
import LoadReadout from './ui/LoadReadout.jsx';
import DialGauge from './ui/DialGauge.jsx';
import StressStrainChart from './ui/StressStrainChart.jsx';

export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans text-slate-900 antialiased select-none">
      {/* 48px Fixed Header */}
      <Header />

      {/* 3-Column Body Layout [260px | 1fr | 340px] with independent column scrolling */}
      <div className="flex-1 grid grid-cols-[260px_1fr_340px] min-h-0 h-[calc(100vh-48px)] overflow-hidden">
        {/* Left Panel: Stepper */}
        <Stepper />

        {/* Center Panel: Main Viewport & Tools */}
        <CenterPanel />

        {/* Right Panel: Independent Scrolling Instrument Rack */}
        <aside className="w-[340px] bg-white border-l border-slate-200 flex flex-col h-full min-h-0 overflow-y-auto">
          <LoadReadout />
          <DialGauge />
          <StressStrainChart />
        </aside>
      </div>
    </div>
  );
}
