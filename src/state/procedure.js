export const STEPS = [
  { id: 'CLEAN',    title: 'Clean platens' },
  { id: 'MEASURE',  title: 'Measure specimen' },
  { id: 'CENTER',   title: 'Center specimen' },
  { id: 'APPROACH', title: 'Lower crosshead to contact' },
  { id: 'SAFETY',   title: 'Supervisor safety check' },
  { id: 'TEST',     title: 'Apply load to failure' },
  { id: 'RECORD',   title: 'Record and export' },
];

const GUARDS = {
  CLEAN:    (s) => s.platensClean,
  MEASURE:  (s) => s.measure.validated,
  CENTER:   (s) => s.specimen.offsetMm <= 0.5,
  APPROACH: (s) => s.utm.inContact && s.utm.tared,
  SAFETY:   (s) => s.safety.approved && s.safety.faults.length === 0,
  TEST:     (s) => ['failed', 'limit'].includes(s.test.status),
  RECORD:   () => true,
};

export const canAdvance = (s) => GUARDS[STEPS[s.stepIndex].id](s);

export const advance = (s) =>
  canAdvance(s) && s.stepIndex < STEPS.length - 1
    ? { ...s, stepIndex: s.stepIndex + 1 }
    : s;

export const ACTION_OK = {
  jogCrosshead:  (s) => s.stepIndex === 3,
  approveSafety: (s) => s.stepIndex === 4 && s.role === 'supervisor',
  startTest:     (s) => s.stepIndex === 5 && s.safety.approved && s.test.status === 'idle',
};
