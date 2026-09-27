import * as THREE from 'three';

export function makeSpecimenGeometry(r0, L0) {
  const g = new THREE.CylinderGeometry(r0, r0, L0, 64, 96, false);
  g.translate(0, L0 / 2, 0);
  g.userData.base = g.attributes.position.array.slice();
  return g;
}
