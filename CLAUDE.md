# Virtual Lab: Uniaxial Compression Test (ductile vs brittle)
Stack: Vite + React (plain JS) + Tailwind v4 + @react-three/fiber + drei + zustand + recharts + lucide-react.
Units: mm, N/kN, MPa, s. Scene unit = 10 mm (1 mm = 0.1 unit). Specimen base sits at y = 0.
Rules:
1. src/sim/* is pure JS (no React/Three), covered by vitest.
2. Physics ticks in useFrame; the HUD store updates at most 20 Hz.
3. Only src/state/procedure.js changes stepIndex, via advance() and guarded actions.
4. Measured dims (student caliper) drive reported stress/strain; hidden true dims drive physics and mesh.
5. Never use <Environment preset> (it fetches from a CDN). Use plain lights.
Design (critical): clinical, human-made, hyper-minimal.
- Light UI. Page bg #fafafa, panel bg #ffffff, borders 1px solid #e2e8f0, text #0f172a, muted #64748b.
- One accent only: #0f172a for primary buttons. Status badges are muted (bg-slate-50, text-slate-600, 1px border).
- Font: Inter Variable; readouts use ui-monospace with tabular-nums.
- Radius max 4px. No shadows, gradients, glow, glassmorphism, or animations beyond 150ms color transitions.
- No emoji, no hero copy, no "Welcome". Copy reads like a lab manual: terse, imperative, units always shown.
Definition of done: `npm run build` and `npm test` pass; no console errors or warnings.