import { createStore } from 'zustand/vanilla';
import { MATERIALS } from '../sim/materials.js';
import { generateSpecimen } from '../sim/specimen.js';
import { createTest } from '../sim/engine.js';
import { advance as advanceStep } from './procedure.js';

const initialSpecimen = generateSpecimen(12345);
const initialTest = createTest(MATERIALS.steel, initialSpecimen, 5.0, 0.05);

export const createInitialState = () => ({
  platensClean: false,
  measure: { d0Mean: 0, L0Mean: 0, validated: false },
  specimen: { offsetMm: 0, trueDims: initialSpecimen },
  utm: { inContact: false, tared: false, headTravel: 0 },
  safety: { approved: false, faults: [] },
  test: initialTest,
  role: 'student',
  stepIndex: 0,
  material: MATERIALS.steel,
});

export const store = createStore((set) => ({
  ...createInitialState(),
  advance: () => set((state) => advanceStep(state)),
  retreat: () => set((state) => ({ stepIndex: Math.max(0, state.stepIndex - 1) })),
  reset: () => set(() => createInitialState()),
  setRole: (role) => set({ role }),
  setMaterial: (mat) => set({ material: mat }),
}));
