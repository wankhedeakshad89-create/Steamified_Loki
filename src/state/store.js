import { createStore } from 'zustand/vanilla';
import { MATERIALS } from '../sim/materials.js';
import { generateSpecimen } from '../sim/specimen.js';
import { createTest } from '../sim/engine.js';
import { advance as advanceStep } from './procedure.js';

const initialSpecimen = generateSpecimen(12345);
const defaultRateForMaterial = (mat) => (mat?.brittle ? 0.02 : 0.5);
const initialTest = createTest(MATERIALS.steel, initialSpecimen, 40.0, defaultRateForMaterial(MATERIALS.steel));

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
    set((state) => {
      const rate = defaultRateForMaterial(mat);
      const newTest = createTest(mat, state.specimen.trueDims, state.utm.contactTravel, rate);
      return {
        material: mat,
        test: newTest,
      };
    });
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
  startTest: (customRate) => {
    set((state) => {
      const rate = customRate ?? state.test?.rate ?? defaultRateForMaterial(state.material);
      const measured = state.measure?.validated ? { d0: state.measure.d0Mean, L0: state.measure.L0Mean } : null;
      const newTest = createTest(state.material, state.specimen.trueDims, state.utm.contactTravel, rate, measured);
      newTest.status = 'running';
      newTest.headTravel = state.utm.contactTravel;
      return { test: newTest };
    });
  },
  stopTest: () => {
    set((state) => ({
      test: {
        ...state.test,
        status: state.test.status === 'running' ? 'idle' : state.test.status,
      },
    }));
  },
  emergencyStop: () => {
    set((state) => ({
      test: {
        ...state.test,
        status: 'limit',
      },
    }));
  },
  setTestRate: (rate) => {
    set((state) => ({
      test: {
        ...state.test,
        rate,
      },
    }));
  },
  updateTestState: (testState) => {
    set((state) => ({
      test: testState,
      utm: {
        ...state.utm,
        headTravel: testState.headTravel,
      },
    }));
  },
  setPlatensClean: (clean = true) => set({ platensClean: clean }),
  validateMeasure: (d0Mean, L0Mean) => set({ measure: { d0Mean, L0Mean, validated: true } }),
  setSpecimenOffset: (offsetMm) => set((state) => ({ specimen: { ...state.specimen, offsetMm } })),
  approveSafety: () => set({ safety: { approved: true, faults: [] } }),
}));
