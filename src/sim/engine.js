import { evaluate } from './materials.js';

export function createTest(material, spec, contactTravel, rate, measured = null) {
  const mD0 = measured?.d0 ?? spec.d0;
  const mL0 = measured?.L0 ?? spec.L0;
  return {
    material,
    spec,
    measured: { d0: mD0, L0: mL0 },
    contactTravel,
    rate,
    status: 'idle',
    t: 0,
    headTravel: 0,
    deltaL: 0,
    e: 0,
    loadkN: 0,
    sigmaEng: 0,
    sigmaTrue: 0,
    records: [],
    lastLoggedDeltaL: -1,
    failTime: null,
    peakLoad: 0,
  };
}

export function stepTest(state, dt) {
  if (state.status === 'limit') return state;

  const nextState = { ...state, records: [...state.records] };
  if (nextState.status === 'idle') {
    nextState.status = 'running';
  }

  const dh = nextState.rate * dt;
  const maxStep = 0.002;
  const numSteps = Math.max(1, Math.ceil(dh / maxStep));
  const subDt = dt / numSteps;
  const subDh = dh / numSteps;

  const trueA0 = (Math.PI * Math.pow(nextState.spec.d0, 2)) / 4;
  const measA0 = (Math.PI * Math.pow(nextState.measured.d0, 2)) / 4;
  const trueL0 = nextState.spec.L0;
  const measL0 = nextState.measured.L0;

  for (let step = 0; step < numSteps; step++) {
    nextState.t += subDt;
    nextState.headTravel += subDh;
    nextState.deltaL = Math.max(0, nextState.headTravel - nextState.contactTravel);

    if (nextState.status === 'failed') {
      const tSinceFail = nextState.t - nextState.failTime;
      nextState.loadkN = nextState.peakLoad * Math.exp(-tSinceFail / 0.05);
      nextState.sigmaEng = (nextState.loadkN * 1000) / measA0;
      const currentTrueA = trueA0 / Math.max(1e-6, 1 - (nextState.deltaL / trueL0));
      nextState.sigmaTrue = (nextState.loadkN * 1000) / currentTrueA;
      continue;
    }

    if (nextState.deltaL > 0) {
      const eTrue = nextState.deltaL / trueL0;
      const eRep = nextState.deltaL / measL0;
      nextState.e = eRep;

      const evalRes = evaluate(nextState.material, trueA0, eTrue);
      nextState.loadkN = evalRes.loadkN;
      nextState.sigmaTrue = evalRes.sigmaTrue;
      nextState.sigmaEng = (nextState.loadkN * 1000) / measA0;

      if (evalRes.failed) {
        nextState.status = 'failed';
        nextState.failTime = nextState.t;
        nextState.peakLoad = evalRes.loadkN;
        nextState.records.push({
          t: nextState.t,
          deltaL: nextState.deltaL,
          loadkN: nextState.loadkN,
          sigmaEng: nextState.sigmaEng,
          strain: nextState.e,
        });
        nextState.lastLoggedDeltaL = nextState.deltaL;
      } else if (!nextState.material.brittle && eTrue >= (nextState.material.eLimit ?? 0.50)) {
        nextState.status = 'limit';
        break;
      }
    }

    if (nextState.status !== 'failed') {
      const minLogInterval = 0.002 + 0.01 * (nextState.lastLoggedDeltaL < 0 ? 0 : nextState.lastLoggedDeltaL);
      if (
        nextState.lastLoggedDeltaL < 0 ||
        nextState.deltaL - nextState.lastLoggedDeltaL >= minLogInterval
      ) {
        nextState.records.push({
          t: nextState.t,
          deltaL: nextState.deltaL,
          loadkN: nextState.loadkN,
          sigmaEng: nextState.sigmaEng,
          strain: nextState.e,
        });
        nextState.lastLoggedDeltaL = nextState.deltaL;
      }
    }
  }

  return nextState;
}
