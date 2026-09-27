export const MATERIALS = {
  steel: { id: 'steel', label: 'Mild steel (ductile)', brittle: false, E: 200000, sigmaY: 250, luders: 0.015, K: 500, n: 0.45, nu: 0.30, eLimit: 0.50 },
  castIron: { id: 'castIron', label: 'Grey cast iron (brittle)', brittle: true, E: 100000, sigmaUC: 650, epsPeak: 0.014, nu: 0.26, fractureDeg: 45 },
};

export function evaluate(mat, A0, e) {
  const A = A0 / (1 - e);
  let sigmaTrue, failed = false;
  if (mat.brittle) {
    sigmaTrue = mat.E * e * (1 - e / (2 * mat.epsPeak));
    failed = sigmaTrue >= mat.sigmaUC;
  } else {
    const et = -Math.log(1 - e);
    const eY = mat.sigmaY / mat.E; // 0.00125
    const eP = Math.max(0, et - eY);
    sigmaTrue = et <= eY ? mat.E * et
      : eP <= mat.luders ? mat.sigmaY
      : mat.sigmaY + mat.K * Math.pow(eP - mat.luders, mat.n);
  }
  const loadkN = (sigmaTrue * A) / 1000;
  return { sigmaTrue, sigmaEng: (loadkN * 1000) / A0, loadkN, failed };
}
