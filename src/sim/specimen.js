function createPRNG(seed = 12345) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSpecimen(seed = 12345) {
  const rand = createPRNG(seed);
  const d0 = 20 + (rand() * 2 - 1) * 0.05;
  const L0 = 30 + (rand() * 2 - 1) * 0.10;
  const taper = {
    top: d0 + (rand() * 2 - 1) * 0.03,
    mid: d0 + (rand() * 2 - 1) * 0.03,
    bottom: d0 + (rand() * 2 - 1) * 0.03,
  };
  const zeroError = 0.02;

  return {
    seed,
    d0,
    L0,
    taper,
    zeroError,
  };
}
