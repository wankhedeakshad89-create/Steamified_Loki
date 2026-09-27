import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function Vernier() {
  const trueDims = useStore(store, (s) => s.specimen.trueDims);
  const validateMeasure = useStore(store, (s) => s.validateMeasure);
  const measureState = useStore(store, (s) => s.measure);

  const trueD0 = trueDims?.d0 ?? 20.0;
  const trueL0 = trueDims?.L0 ?? 30.0;
  const zeroError = trueDims?.zeroError ?? 0.02;
  const taper = trueDims?.taper ?? { top: trueD0, mid: trueD0, bottom: trueD0 };

  // Mode: 'L0' (Height) or 'd0' (Diameter)
  const [mode, setMode] = useState('d0');
  // Diameter position: 'top', 'mid', 'bottom'
  const [diamPosition, setDiamPosition] = useState('top');

  // Determine current target specimen dimension
  const getTargetDim = useCallback(() => {
    if (mode === 'L0') return trueL0;
    if (diamPosition === 'top') return taper.top;
    if (diamPosition === 'mid') return taper.mid;
    return taper.bottom;
  }, [mode, diamPosition, trueL0, taper]);

  const targetDim = getTargetDim();

  // Jaw opening distance x in mm (initialized to targetDim + zeroError + 0.04 mm for reading)
  const [opening, setOpening] = useState(targetDim + zeroError);

  // Keep opening clamped when mode or target changes
  useEffect(() => {
    setOpening((prev) => Math.max(targetDim, prev));
  }, [targetDim]);

  // Measurement logic formulas
  const rawOpening = opening;
  const msr = Math.floor(rawOpening);
  const fraction = rawOpening - msr;
  const vsr = Math.min(49, Math.max(0, Math.round(fraction / 0.02)));
  const uncorrected = msr + vsr * 0.02;
  const corrected = uncorrected - zeroError;

  // Reading record log
  const [readings, setReadings] = useState([]);

  // Drag state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startOpeningRef = useRef(opening);
  const containerRef = useRef(null);

  // SVG Scaling: 1 mm = 9 pixels
  const PX_PER_MM = 9;
  const MAIN_SCALE_START_X = 120;
  const SCALE_Y = 90;

  // Handle Dragging
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startOpeningRef.current = opening;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const dxPx = e.clientX - startXRef.current;
    const dxMm = dxPx / PX_PER_MM;
    const newOpening = Math.max(targetDim, startOpeningRef.current + dxMm);
    setOpening(newOpening);
  }, [targetDim]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Handle Keyboard Arrow Navigation
  const handleKeyDown = (e) => {
    let delta = 0;
    if (e.key === 'ArrowLeft') delta = e.shiftKey ? -1.0 : -0.02;
    if (e.key === 'ArrowRight') delta = e.shiftKey ? 1.0 : 0.02;

    if (delta !== 0) {
      e.preventDefault();
      setOpening((prev) => Math.max(targetDim, Math.round((prev + delta) * 100) / 100));
    }
  };

  // Record Reading
  const recordReading = () => {
    const newRecord = {
      id: Date.now(),
      mode,
      position: mode === 'd0' ? diamPosition : 'Height',
      msr,
      vsr,
      uncorrected: uncorrected.toFixed(2),
      corrected: corrected.toFixed(2),
      correctedNum: parseFloat(corrected.toFixed(2)),
    };

    const nextReadings = [...readings, newRecord];
    setReadings(nextReadings);

    // Check if we have at least 3 diameter & 3 height readings
    const dReadings = nextReadings.filter((r) => r.mode === 'd0');
    const hReadings = nextReadings.filter((r) => r.mode === 'L0');

    if (dReadings.length >= 3 && hReadings.length >= 3) {
      const d0Mean = dReadings.reduce((sum, r) => sum + r.correctedNum, 0) / dReadings.length;
      const L0Mean = hReadings.reduce((sum, r) => sum + r.correctedNum, 0) / hReadings.length;

      const d0Accurate = Math.abs(d0Mean - trueD0) <= 0.06;
      const L0Accurate = Math.abs(L0Mean - trueL0) <= 0.06;

      if (d0Accurate && L0Accurate) {
        validateMeasure(parseFloat(d0Mean.toFixed(2)), parseFloat(L0Mean.toFixed(2)));
      }
    }
  };

  const dReadingsCount = readings.filter((r) => r.mode === 'd0').length;
  const hReadingsCount = readings.filter((r) => r.mode === 'L0').length;
  const isValidated = measureState?.validated ?? false;

  // Main Scale Ticks (0 to 60 mm)
  const mainTicks = Array.from({ length: 61 }, (_, mm) => {
    const x = MAIN_SCALE_START_X + mm * PX_PER_MM;
    const isMajor = mm % 10 === 0;
    const isMedium = mm % 5 === 0 && !isMajor;
    const len = isMajor ? 24 : isMedium ? 16 : 10;

    return { mm, x, isMajor, isMedium, len };
  });

  // Sliding Jaw Position
  const slidingJawX = MAIN_SCALE_START_X + opening * PX_PER_MM;

  // Vernier Scale Ticks (50 divisions spanning 49 mm, division = 0.98 mm)
  const vernierTicks = Array.from({ length: 51 }, (_, div) => {
    const x = slidingJawX + div * 0.98 * PX_PER_MM;
    const isMajor = div % 10 === 0;
    const isMedium = div % 5 === 0 && !isMajor;
    const len = isMajor ? 20 : isMedium ? 14 : 9;
    const isCoincident = div === vsr;

    return { div, x, isMajor, isMedium, len, isCoincident };
  });

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full h-full bg-white flex flex-col justify-between p-3 select-none outline-none overflow-y-auto"
    >
      {/* Top Manual Instructions Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-[4px] p-2 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">Vernier Caliper Station</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Least Count: <strong className="font-mono">0.02 mm</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Zero Error: <strong className="font-mono">+{zeroError.toFixed(2)} mm</strong></span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Use mouse drag or ←/→ arrow keys (Shift+←/→ for ±1.0mm)
        </div>
      </div>

      {/* Interactive Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/60 p-2.5 border border-slate-200 rounded-[4px] text-xs">
        <div className="flex items-center gap-3">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Mode:</span>
            <div className="flex bg-white p-0.5 rounded-[3px] border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('d0')}
                className={`h-6 px-2.5 rounded-[2px] text-xs transition-colors ${
                  mode === 'd0' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Measure Diameter (d₀)
              </button>
              <button
                type="button"
                onClick={() => setMode('L0')}
                className={`h-6 px-2.5 rounded-[2px] text-xs transition-colors ${
                  mode === 'L0' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Measure Height (L₀)
              </button>
            </div>
          </div>

          {/* Position Selector for Diameter */}
          {mode === 'd0' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Position:</span>
              <div className="flex bg-white p-0.5 rounded-[3px] border border-slate-200">
                {['top', 'mid', 'bottom'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setDiamPosition(pos)}
                    className={`h-6 px-2 rounded-[2px] text-xs uppercase font-mono transition-colors ${
                      diamPosition === pos ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Record Reading Button & Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={recordReading}
            className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold rounded-[4px] border border-[#0f172a] hover:bg-slate-800 active:bg-slate-900 shadow-xs cursor-pointer"
          >
            Record Reading
          </button>

          {isValidated ? (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 rounded-[4px] text-xs flex items-center gap-1">
              ✓ Measurement Verified
            </span>
          ) : (dReadingsCount < 3 || hReadingsCount < 3) ? (
            <span className="text-[11px] text-slate-500 font-mono">
              Progress: d₀ ({dReadingsCount}/3), L₀ ({hReadingsCount}/3)
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-medium border border-amber-300 rounded-[4px] text-xs">
              Readings inconsistent. Re-measure specimen.
            </span>
          )}
        </div>
      </div>

      {/* SVG Vernier Caliper Visual Diagram */}
      <div className="w-full bg-slate-900 rounded-[4px] border border-slate-800 p-2 flex justify-center items-center overflow-x-auto relative">
        <svg width="700" height="230" viewBox="0 0 700 230" className="select-none">
          {/* Main Scale Bar */}
          <rect x="60" y="50" width="600" height="40" fill="#334155" stroke="#475569" strokeWidth="1.5" rx="2" />

          {/* Main Scale Ticks (1 mm graduations) */}
          {mainTicks.map((t) => (
            <g key={t.mm}>
              <line
                x1={t.x}
                y1={SCALE_Y}
                x2={t.x}
                y2={SCALE_Y - t.len}
                stroke="#e2e8f0"
                strokeWidth={t.isMajor ? 1.5 : 1}
              />
              {t.isMajor && (
                <text
                  x={t.x}
                  y={SCALE_Y - 28}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#94a3b8"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {t.mm}
                </text>
              )}
            </g>
          ))}

          {/* Fixed Anvil / Left Jaw */}
          <path
            d="M 60 50 L 60 190 L 95 190 L 105 130 L 120 130 L 120 90 L 60 50 Z"
            fill="#475569"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          {/* Fixed Jaw Reference Line (at x = 120 mm) */}
          <line x1={MAIN_SCALE_START_X} y1="90" x2={MAIN_SCALE_START_X} y2="190" stroke="#94a3b8" strokeWidth="2" />

          {/* Specimen Silhouette (Width = opening * PX_PER_MM) */}
          <g transform={`translate(${MAIN_SCALE_START_X}, 130)`}>
            {mode === 'd0' ? (
              /* Diameter Cross-section Silhouette (Circular/Cylindrical profile) */
              <rect
                x="0"
                y="-25"
                width={opening * PX_PER_MM}
                height="50"
                fill="#38bdf8"
                fillOpacity="0.25"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                rx="3"
              />
            ) : (
              /* Height Profile Silhouette (Rectangular specimen block) */
              <rect
                x="0"
                y="-35"
                width={opening * PX_PER_MM}
                height="70"
                fill="#a78bfa"
                fillOpacity="0.25"
                stroke="#a78bfa"
                strokeWidth="1.5"
                rx="2"
              />
            )}
            {/* Dimension Label overlay */}
            <text
              x={(opening * PX_PER_MM) / 2}
              y="4"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {mode === 'd0' ? `d₀ (${diamPosition}): ${targetDim.toFixed(2)} mm` : `L₀: ${targetDim.toFixed(2)} mm`}
            </text>
          </g>

          {/* Sliding Jaw Assembly */}
          <g
            transform={`translate(${slidingJawX - MAIN_SCALE_START_X}, 0)`}
            onMouseDown={handleMouseDown}
            className="cursor-ew-resize"
          >
            {/* Sliding Frame Box encompassing Main Scale */}
            <rect x="110" y="42" width="160" height="56" fill="#1e293b" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1.5" rx="3" />

            {/* Sliding Jaw Stem */}
            <path
              d="M 120 90 L 120 190 L 100 190 L 110 130 L 110 90 Z"
              fill="#475569"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            {/* Sliding Jaw Contact Line */}
            <line x1={MAIN_SCALE_START_X} y1="90" x2={MAIN_SCALE_START_X} y2="190" stroke="#38bdf8" strokeWidth="2" />

            {/* Vernier Scale Ticks (50 divisions) */}
            {vernierTicks.map((vt) => (
              <g key={vt.div}>
                <line
                  x1={vt.x}
                  y1={SCALE_Y}
                  x2={vt.x}
                  y2={SCALE_Y + vt.len}
                  stroke={vt.isCoincident ? '#38bdf8' : vt.isMajor ? '#e2e8f0' : '#94a3b8'}
                  strokeWidth={vt.isCoincident ? 2.5 : vt.isMajor ? 1.5 : 1}
                />
                {vt.isMajor && (
                  <text
                    x={vt.x}
                    y={SCALE_Y + 30}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill={vt.isCoincident ? '#38bdf8' : '#cbd5e1'}
                    fontFamily="monospace"
                    fontWeight={vt.isCoincident ? 'bold' : 'normal'}
                  >
                    {vt.div}
                  </text>
                )}
              </g>
            ))}

            {/* Coincidence Accent Indicator Arrow */}
            {vernierTicks.find((vt) => vt.isCoincident) && (
              <polygon
                points={`${vernierTicks[vsr].x - 4},${SCALE_Y + 35} ${vernierTicks[vsr].x + 4},${SCALE_Y + 35} ${vernierTicks[vsr].x},${SCALE_Y + 24}`}
                fill="#38bdf8"
              />
            )}
          </g>
        </svg>
      </div>

      {/* Measurement Readout Summary Strip */}
      <div className="grid grid-cols-4 gap-2 bg-slate-900 text-white p-2.5 rounded-[4px] border border-slate-800 font-mono text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans">Main Scale (MSR):</span>
          <span className="text-base font-bold text-slate-100">{msr} <span className="text-xs font-normal text-slate-400">mm</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans">Vernier Div (VSR):</span>
          <span className="text-base font-bold text-sky-400">{vsr} <span className="text-xs font-normal text-slate-400">({(vsr * 0.02).toFixed(2)} mm)</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans">Uncorrected Reading:</span>
          <span className="text-base font-bold text-amber-300">{uncorrected.toFixed(2)} <span className="text-xs font-normal text-slate-400">mm</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-sans">Corrected Reading (-0.02):</span>
          <span className="text-base font-bold text-emerald-400">{corrected.toFixed(2)} <span className="text-xs font-normal text-slate-400">mm</span></span>
        </div>
      </div>

      {/* Tabular Reading Log */}
      <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden max-h-[140px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-sans font-semibold text-slate-500 uppercase">
              <th className="p-1.5 pl-3">#</th>
              <th className="p-1.5">Mode</th>
              <th className="p-1.5">Pos</th>
              <th className="p-1.5">MSR (mm)</th>
              <th className="p-1.5">VSR</th>
              <th className="p-1.5">Raw (mm)</th>
              <th className="p-1.5 pr-3">Corrected (mm)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {readings.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-2.5 text-center text-slate-400 font-sans italic text-xs">
                  No readings recorded yet. Adjust caliper and click "Record Reading".
                </td>
              </tr>
            ) : (
              readings.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-1.5 pl-3 text-slate-400">{idx + 1}</td>
                  <td className="p-1.5 font-sans font-medium text-slate-900">{r.mode === 'd0' ? 'Diameter (d₀)' : 'Height (L₀)'}</td>
                  <td className="p-1.5 uppercase text-slate-500">{r.position}</td>
                  <td className="p-1.5">{r.msr}</td>
                  <td className="p-1.5 text-sky-600 font-semibold">{r.vsr}</td>
                  <td className="p-1.5">{r.uncorrected}</td>
                  <td className="p-1.5 pr-3 font-semibold text-emerald-600">{r.corrected}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
