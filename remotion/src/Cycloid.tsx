import {useCurrentFrame, useVideoConfig, AbsoluteFill} from 'remotion';

/**
 * Rolling-cycloid animation for the "ruck in a rug" tutorial.
 *
 * A fully-rolled ruck is kinematically a hoop of radius a = Δ/2π (Theorem 4).
 * Rolling without slip, a material point on the rim traces a cycloid:
 *     x(τ) = startX + a(τ − sin τ),   y(τ) = a(1 − cos τ),   τ = c·t / a
 * Its lab speed is |v| = 2c·|sin(τ/2)|  →  0 at the contact (τ=0), 2c at the apex (τ=π).
 * Successive cusps are 2πa = Δ apart: one revolution advances the runner by Δ.
 */

// --- pure kinematics (testable) ----------------------------------------------
const rimSpeed = (tau: number, c: number) => c * Math.sqrt(2 - 2 * Math.cos(tau));
// sanity: apex (τ=π) speed must be exactly 2c, contact (τ=0) must be 0.
if (Math.abs(rimSpeed(Math.PI, 1) - 2) > 1e-9 || Math.abs(rimSpeed(0, 1)) > 1e-9) {
  // eslint-disable-next-line no-console
  console.error('rimSpeed identity violated');
}

// geometry (pixels)
const W = 1280;
const H = 720;
const floorY = 590;
const a = 95; // hoop radius; visual Δ = 2πa
const startX = 150;
const cPix = 118; // propagation speed, px/s  (this is "c")
const vScale = 0.62; // px per (px/s) for drawing velocity arrows

const COL = {
  bg: '#0f1117',
  floor: '#3a3f4b',
  runner: '#c9a227',
  hoop: '#e7e3d8',
  spoke: '#7a8190',
  trail: '#d98c00',
  point: '#ffb020',
  vel: '#e0563b',
  velField: '#5aa9d6',
  text: '#e7e3d8',
  dim: '#8b93a3',
  accent: '#e0563b',
};

const Arrow: React.FC<{
  x: number; y: number; dx: number; dy: number; color: string; width?: number;
}> = ({x, y, dx, dy, color, width = 3}) => {
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return null;
  const ux = dx / len;
  const uy = dy / len;
  const hx = x + dx;
  const hy = y + dy;
  const head = Math.min(10, len * 0.5);
  // two barbs
  const bx = hx - ux * head;
  const by = hy - uy * head;
  const px = -uy;
  const py = ux;
  return (
    <g>
      <line x1={x} y1={y} x2={hx} y2={hy} stroke={color} strokeWidth={width} />
      <polygon
        points={`${hx},${hy} ${bx + px * head * 0.5},${by + py * head * 0.5} ${bx - px * head * 0.5},${by - py * head * 0.5}`}
        fill={color}
      />
    </g>
  );
};

export const Cycloid: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const tau = (cPix * t) / a; // total rolling angle
  const centerX = startX + a * tau;
  const centerYscreen = floorY - a;

  // tracked material point on the rim
  const px = startX + a * (tau - Math.sin(tau));
  const pyMath = a * (1 - Math.cos(tau));
  const pyScreen = floorY - pyMath;

  // its velocity (math frame y-up): (c(1-cosτ), c sinτ); screen y is down
  const vx = cPix * (1 - Math.cos(tau));
  const vyMath = cPix * Math.sin(tau);
  const speed = rimSpeed(tau, cPix);

  // accumulated cycloid trail up to current τ
  const trail: string[] = [];
  const steps = 240;
  for (let i = 0; i <= steps; i++) {
    const tp = (tau * i) / steps;
    const tx = startX + a * (tp - Math.sin(tp));
    const ty = floorY - a * (1 - Math.cos(tp));
    if (tx > -50 && tx < W + 50) trail.push(`${tx.toFixed(1)},${ty.toFixed(1)}`);
  }

  // velocity field: 8 material points currently on the rim
  const field = Array.from({length: 8}, (_, k) => {
    const tk = tau + (k * 2 * Math.PI) / 8;
    const x = centerX - a * Math.sin(tk);
    const y = floorY - (a - a * Math.cos(tk)); // = floorY - a + a cos tk
    const fdx = cPix * (1 - Math.cos(tk)) * vScale;
    const fdy = -cPix * Math.sin(tk) * vScale;
    return {x, y, fdx, fdy, top: Math.abs(((tk % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) < 0.25};
  });

  // cusps (contact points) bracket one Δ = 2πa
  const nCusp = Math.floor(tau / (2 * Math.PI));
  const cuspL = startX + a * (2 * Math.PI * nCusp);
  const cuspR = cuspL + 2 * Math.PI * a;

  const fmt = (n: number) => n.toFixed(0);

  return (
    <AbsoluteFill style={{backgroundColor: COL.bg, fontFamily: 'Georgia, serif'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* floor / runner */}
        <line x1={0} y1={floorY} x2={W} y2={floorY} stroke={COL.floor} strokeWidth={2} />
        <line x1={0} y1={floorY} x2={cuspL} y2={floorY} stroke={COL.runner} strokeWidth={5} />
        <line x1={cuspR} y1={floorY} x2={W} y2={floorY} stroke={COL.runner} strokeWidth={5} />
        <text x={40} y={floorY + 34} fill={COL.dim} fontSize={20} fontStyle="italic">
          runner (rug) lies flat fore and aft
        </text>

        {/* Δ bracket between cusps */}
        {cuspR < W + 200 && (
          <g>
            <line x1={cuspL} y1={floorY + 16} x2={cuspR} y2={floorY + 16} stroke={COL.accent} strokeWidth={2} />
            <line x1={cuspL} y1={floorY + 10} x2={cuspL} y2={floorY + 22} stroke={COL.accent} strokeWidth={2} />
            <line x1={cuspR} y1={floorY + 10} x2={cuspR} y2={floorY + 22} stroke={COL.accent} strokeWidth={2} />
            <text x={(cuspL + cuspR) / 2} y={floorY + 36} fill={COL.accent} fontSize={22} textAnchor="middle" fontStyle="italic">
              Δ = 2πa  (runner advances Δ per revolution)
            </text>
          </g>
        )}

        {/* cycloid trail */}
        {trail.length > 1 && (
          <polyline points={trail.join(' ')} fill="none" stroke={COL.trail} strokeWidth={2.5} opacity={0.85} />
        )}

        {/* the rolled ruck = hoop */}
        <circle cx={centerX} cy={centerYscreen} r={a} fill="none" stroke={COL.hoop} strokeWidth={4} />
        <line x1={centerX} y1={centerYscreen} x2={px} y2={pyScreen} stroke={COL.spoke} strokeWidth={2} />
        <circle cx={centerX} cy={centerYscreen} r={4} fill={COL.spoke} />

        {/* velocity field on the rim */}
        {field.map((f, i) => (
          <Arrow key={i} x={f.x} y={f.y} dx={f.fdx} dy={f.fdy} color={f.top ? COL.vel : COL.velField} width={f.top ? 3.5 : 2} />
        ))}

        {/* tracked material point + its velocity */}
        <circle cx={px} cy={pyScreen} r={7} fill={COL.point} stroke="#000" strokeWidth={1} />
        <Arrow x={px} y={pyScreen} dx={vx * vScale} dy={-vyMath * vScale} color={COL.vel} width={4} />

        {/* contact-point note */}
        <circle cx={centerX} cy={floorY} r={4} fill={COL.velField} />
        <text x={centerX + 10} y={floorY - 8} fill={COL.velField} fontSize={18} fontStyle="italic">
          contact: v = 0  (no slip)
        </text>

        {/* title + live readouts */}
        <text x={40} y={56} fill={COL.text} fontSize={34}>The ruck rolls like a wheel</text>
        <text x={40} y={92} fill={COL.dim} fontSize={20} fontStyle="italic">
          a fully-rolled ruck ≡ a hoop of radius a = Δ/2π   (Theorems 3–4)
        </text>

        <g transform="translate(40,150)">
          <text x={0} y={0} fill={COL.text} fontSize={24}>|v| = 2c · sin(θ/2)</text>
          <text x={0} y={34} fill={COL.dim} fontSize={20}>θ = {fmt(((tau % (2 * Math.PI)) * 180) / Math.PI)}°</text>
          <text x={0} y={62} fill={COL.dim} fontSize={20}>
            |v| = {(speed / cPix).toFixed(2)} c
          </text>
          <text x={0} y={94} fill={COL.vel} fontSize={20}>apex speed → 2c</text>
          <text x={0} y={122} fill={COL.velField} fontSize={20}>contact speed → 0</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
