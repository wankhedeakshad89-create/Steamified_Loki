export function radialFactor(t, e, b) {
  const k = 1 / Math.sqrt((1 - e) * (1 + (4 * b) / Math.PI + (b * b) / 2));
  return k * (1 + b * Math.sin(Math.PI * t));
}

export function barrelAmplitude(mat, ePlastic, mu = 0.3) {
  if (mat?.brittle) return 0;
  return 0.2 * (mu / 0.3) * (1 - Math.exp(-ePlastic / 0.15));
}

export function deformSpecimen(geo, L0, e, b) {
  if (!geo || !geo.attributes || !geo.attributes.position || !geo.userData || !geo.userData.base) return;
  const pos = geo.attributes.position;
  const base = geo.userData.base;
  const L = L0 * (1 - e);
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, base[3 * i + 1] / L0));
    const f = radialFactor(t, e, b);
    pos.setXYZ(i, base[3 * i] * f, t * L, base[3 * i + 2] * f);
  }
  pos.needsUpdate = true;
  if (typeof geo.computeVertexNormals === 'function') geo.computeVertexNormals();
  if (typeof geo.computeBoundingSphere === 'function') geo.computeBoundingSphere();
}
