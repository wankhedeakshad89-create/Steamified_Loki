import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function DialGauge() {
  const headTravel = useStore(store, (s) => s.test?.headTravel ?? s.utm?.headTravel ?? 0);
  const deltaL = useStore(store, (s) => s.test?.deltaL ?? 0);

  // Main dial needle angle (1 full rev = 1.00 mm)
  const mainAngle = (deltaL % 1) * 360;

  // Rev counter whole mm
  const revCount = Math.floor(deltaL);
  const revAngle = (Math.min(15, revCount) / 15) * 360;

  // Generate 100 ticks
  const mainTicks = Array.from({ length: 100 }, (_, i) => {
    const isMajor = i % 10 === 0;
    const isMedium = i % 5 === 0 && !isMajor;
    const angleRad = (i * 3.6 * Math.PI) / 180;
    const rOuter = 68;
    const rInner = isMajor ? 56 : isMedium ? 60 : 64;

    const x1 = 80 + rOuter * Math.sin(angleRad);
    const y1 = 80 - rOuter * Math.cos(angleRad);
    const x2 = 80 + rInner * Math.sin(angleRad);
    const y2 = 80 - rInner * Math.cos(angleRad);

    const labelR = 48;
    const labelX = 80 + labelR * Math.sin(angleRad);
    const labelY = 80 - labelR * Math.cos(angleRad);
    const labelVal = (i / 100).toFixed(1);

    return { i, x1, y1, x2, y2, isMajor, isMedium, labelX, labelY, labelVal };
  });

  return (
    <div className="bg-white border-b border-slate-200 flex flex-col select-none">
      {/* Header */}
      <div className="h-[32px] px-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        <span>Displacement Dial Gauge</span>
        <span className="font-mono text-[10px] text-slate-400">0.01 mm / div</span>
      </div>

      {/* SVG Dial Container */}
      <div className="p-3 flex flex-col items-center justify-center bg-white">
        <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-xs">
          {/* Dial Outer Bezel */}
          <circle cx="80" cy="80" r="76" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="80" cy="80" r="72" fill="none" stroke="#f1f5f9" strokeWidth="2" />

          {/* Main Dial Ticks */}
          {mainTicks.map((t) => (
            <g key={t.i}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isMajor ? '#0f172a' : t.isMedium ? '#475569' : '#cbd5e1'}
                strokeWidth={t.isMajor ? 1.5 : 1}
              />
              {t.isMajor && (
                <text
                  x={t.labelX}
                  y={t.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="7.5"
                  fontWeight="600"
                  fill="#334155"
                  fontFamily="monospace"
                >
                  {t.labelVal}
                </text>
              )}
            </g>
          ))}

          {/* Secondary Rev Counter Sub-Dial (at cx=80, cy=112, r=18) */}
          <g transform="translate(80, 112)">
            <circle cx="0" cy="0" r="18" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            {Array.from({ length: 15 }, (_, k) => {
              const rad = (k * (360 / 15) * Math.PI) / 180;
              const sx1 = 16 * Math.sin(rad);
              const sy1 = -16 * Math.cos(rad);
              const sx2 = 13 * Math.sin(rad);
              const sy2 = -13 * Math.cos(rad);
              return <line key={k} x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#64748b" strokeWidth="0.8" />;
            })}
            {/* Rev Needle */}
            <g transform={`rotate(${revAngle})`}>
              <line x1="0" y1="0" x2="0" y2="-12" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            <circle cx="0" cy="0" r="2" fill="#0f172a" />
          </g>

          {/* Main Needle */}
          <g transform={`translate(80, 80) rotate(${mainAngle})`}>
            {/* Counterweight */}
            <line x1="0" y1="0" x2="0" y2="14" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            {/* Needle Shaft */}
            <line x1="0" y1="0" x2="0" y2="-62" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Center Cap */}
          <circle cx="80" cy="80" r="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
        </svg>

        {/* Digital Readout */}
        <div className="mt-2 text-center select-none font-mono">
          <div className="text-xs text-slate-500 font-sans font-medium">Deflection (ΔL):</div>
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {deltaL.toFixed(3)} <span className="text-xs font-normal text-slate-500">mm</span>
          </div>
          <div className="text-[10px] text-slate-400">Head Travel: {headTravel.toFixed(3)} mm</div>
        </div>
      </div>
    </div>
  );
}
