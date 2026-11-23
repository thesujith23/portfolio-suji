/* The red slide — one source of truth for the 3D chute and the DOM rider.
   Design space is 200 wide × 1000 tall; the camera maps it onto the section. */

export const SLIDE_W = 200;
export const SLIDE_H = 1000;

const SWAY = 58;
const TURNS = 3.1;
/* Head room for the station at the top and floor room under the exit. */
const TOP_PAD = 130;
const BOTTOM_PAD = 80;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function baseX(t) {
  return SLIDE_W / 2 + Math.sin(t * Math.PI * TURNS) * SWAY;
}

export function baseY(t) {
  return -TOP_PAD - t * (SLIDE_H - TOP_PAD - BOTTOM_PAD);
}

/* Gentle depth wobble so the chute catches the light from the side. */
export function baseZ(t) {
  return Math.sin(t * Math.PI * 5.5) * 12;
}

/* Point, travel direction (degrees, -90 = straight down) and steepness. */
export function pointAt(tRaw) {
  const t = clamp01(tRaw);
  const step = 0.002;
  const x = baseX(t);
  const y = baseY(t);
  const z = baseZ(t);
  const dx = baseX(clamp01(t + step)) - x;
  const dy = baseY(clamp01(t + step)) - y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return { t, x, y, z, angle };
}

/* The 3D chute is rotated a little so its walls read as depth. The rider uses
   the same projection and can never drift off the bed. */
export const SLIDE_ROT_X = 0.03;
export const SLIDE_ROT_Y = -0.16;
export const BED_LIFT = 4.6;

export function projectToScreen(x, y, z) {
  const c1 = Math.cos(SLIDE_ROT_X);
  const s1 = Math.sin(SLIDE_ROT_X);
  const c2 = Math.cos(SLIDE_ROT_Y);
  const s2 = Math.sin(SLIDE_ROT_Y);
  return {
    x: c2 * x + s2 * z,
    y: s1 * s2 * x + c1 * y - s1 * c2 * z,
  };
}

/* Where the ladder platform sits, so the ride never begins in mid-air. */
export function platformPoint() {
  return { x: baseX(0) - 30, y: baseY(0) + 58, z: baseZ(0) };
}

/* The lip at the very bottom of the chute, on the sliding surface. */
export function exitPoint() {
  const p = pointAt(1);
  return { x: p.x, y: p.y, z: p.z + BED_LIFT };
}

/* Pikachu leaving the slide: gravity, a little forward drift, one small bounce.
   u = 0 at the lip, 1 resting on the ground under the exit. */
export function fallAt(uRaw) {
  const u = clamp01(uRaw);
  const from = exitPoint();
  const drop = 78;
  const x = from.x + 24 * u;
  let y = from.y - drop * (0.3 * u + 0.7 * u * u);
  if (u > 0.7) {
    const b = (u - 0.7) / 0.3;
    y += Math.sin(b * Math.PI) * 14 * (1 - b);
  }
  return { x, y, z: from.z };
}

export function slideSvgPath(steps = 180) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    d += `${i ? 'L' : 'M'}${baseX(t).toFixed(1)} ${baseY(t).toFixed(1)}`;
  }
  return d;
}
