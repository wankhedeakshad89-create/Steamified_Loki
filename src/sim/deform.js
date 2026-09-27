export function radialFactor(t, e, b) {
  const k = 1 / Math.sqrt((1 - e) * (1 + (4 * b) / Math.PI + (b * b) / 2));
  return k * (1 + b * Math.sin(Math.PI * t));
}

export function barrelAmplitude(mat, ePlastic, mu = 0.3) {
  if (mat.brittle) return 0;
  return 0.2 * (mu / 0.3) * (1 - Math.exp(-ePlastic / 0.15));
}
