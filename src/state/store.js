import { createStore } from 'zustand/vanilla';
import { MATERIALS } from '../sim/materials.js';
import { generateSpecimen } from '../sim/specimen.js';
import { createTest } from '../sim/engine.js';
import { advance as advanceStep } from './procedure.js';

const initialSpecimen = generateSpecimen(12345);
const initialTest = createTest(MATERIALS.steel, initialSpecimen, 40.0, 0.05);

export const createInitialState = () => ({
  platensClean: false,
  measure: { d0Mean: 0, L0Mean: 0, validated: false },
  specimen: { offsetMm: 0, trueDims: initialSpecimen },
  utm: { inContact: false, tared: false, headTravel: 0, contactTravel: 40.0 },
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
  setMaterial: (mat) => {
    set((state) => ({
      material: mat,
      test: createTest(mat, state.specimen.trueDims, state.utm.contactTravel, 0.05),
    }));
  },
  setHeadTravel: (travel) => {
    set((state) => {
      const contactTravel = state.utm.contactTravel ?? 40.0;
      const clampedTravel = Math.max(0, Math.min(contactTravel, travel));
      const inContact = clampedTravel >= contactTravel - 1e-4;
      return {
        utm: {
          ...state.utm,
          headTravel: clampedTravel,
          inContact,
        },
        test: {
          ...state.test,
          headTravel: clampedTravel,
        },
      };
    });
  },
  tareUTM: () => {
    set((state) => ({
      utm: { ...state.utm, tared: true },
    }));
  },
  setPlatensClean: (clean = true) => set({ platensClean: clean }),
  validateMeasure: (d0Mean, L0Mean) => set({ measure: { d0Mean, L0Mean, validated: true } }),
  setSpecimenOffset: (offsetMm) => set((state) => ({ specimen: { ...state.specimen, offsetMm } })),
  approveSafety: () => set({ safety: { approved: true, faults: [] } }),
}));
