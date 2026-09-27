import { createStore } from 'zustand/vanilla';
import { MATERIALS } from '../sim/materials.js';
import { generateSpecimen } from '../sim/specimen.js';
import { createTest } from '../sim/engine.js';
import { advance as advanceStep } from './procedure.js';

const defaultRateForMaterial = (mat) => (mat?.brittle ? 0.02 : 0.5);

function generateInitialOffset() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 2.0 + Math.random() * 2.0; // between 2.0 mm and 4.0 mm
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  return { xOffset: x, zOffset: z, offsetMm: radius };
}

export const createInitialState = () => {
  const spec = generateSpecimen(12345);
  const offsetData = generateInitialOffset();
  const mat = MATERIALS.steel;
  const initialTest = createTest(mat, spec, 40.0, defaultRateForMaterial(mat));

  let state = {
    platensClean: false,
    cleanProgress: 0,
    measure: { d0Mean: 0, L0Mean: 0, validated: false },
    specimen: {
      xOffset: offsetData.xOffset,
      zOffset: offsetData.zOffset,
      offsetMm: offsetData.offsetMm,
      trueDims: spec,
    },
    utm: { inContact: false, tared: false, headTravel: 0, contactTravel: 40.0 },
    safety: { approved: false, faults: [] },
    test: initialTest,
    role: 'student',
    stepIndex: 0,
    material: mat,
  };

  // Dev URL query helper (?step=N&material=steel|castIron)
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    const matParam = params.get('material');

    if (matParam && MATERIALS[matParam]) {
      state.material = MATERIALS[matParam];
      state.test = createTest(state.material, spec, 40.0, defaultRateForMaterial(state.material));
    }

    if (stepParam !== null) {
      const sNum = parseInt(stepParam, 10);
      if (!isNaN(sNum) && sNum >= 0 && sNum <= 6) {
        state.stepIndex = sNum;
        if (sNum >= 1) state.platensClean = true;
        if (sNum >= 2) state.measure = { d0Mean: spec.d0, L0Mean: spec.L0, validated: true };
        if (sNum >= 3) state.specimen = { ...state.specimen, xOffset: 0, zOffset: 0, offsetMm: 0 };
        if (sNum >= 4) state.utm = { inContact: true, tared: true, headTravel: 40.0, contactTravel: 40.0 };
        if (sNum >= 5) state.safety = { approved: true, faults: [] };
      }
    }
  }

  return state;
};

export const store = createStore((set) => ({
  ...createInitialState(),
  advance: () => set((state) => advanceStep(state)),
  retreat: () =>
    set((state) => {
      const nextStepIndex = Math.max(0, state.stepIndex - 1);
      return {
        stepIndex: nextStepIndex,
        // Automatically revoke supervisor safety approval if reverting to before safety check (step 4)
        safety: nextStepIndex < 4 ? { ...state.safety, approved: false } : state.safety,
      };
    }),
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
  setCleanProgress: (progress) => {
    set((state) => {
      const clamped = Math.min(1, Math.max(0, progress));
      return {
        cleanProgress: clamped,
        platensClean: clamped >= 1.0,
      };
    });
  },
  nudgeSpecimen: (dx, dz) => {
    set((state) => {
      const newX = state.specimen.xOffset + dx;
      const newZ = state.specimen.zOffset + dz;
      const newOffset = Math.hypot(newX, newZ);
      return {
        specimen: {
          ...state.specimen,
          xOffset: newX,
          zOffset: newZ,
          offsetMm: newOffset,
        },
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
  setPlatensClean: (clean = true) => set({ platensClean: clean, cleanProgress: clean ? 1 : 0 }),
  validateMeasure: (d0Mean, L0Mean) => set({ measure: { d0Mean, L0Mean, validated: true } }),
  setSpecimenOffset: (offsetMm) => set((state) => ({ specimen: { ...state.specimen, offsetMm } })),
  approveSafety: () => set({ safety: { approved: true, faults: [] } }),
}));
