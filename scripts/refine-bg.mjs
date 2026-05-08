/**
 * Background refinement: dissolves visible nebula structure into abstract
 * atmospheric density while preserving composition (left-blue / lower-right
 * purple / dark center corridor).
 *
 * Pipeline:
 *   1. Heavy gaussian blur — destroys recognizable cloud veins/shapes,
 *      leaves only large-scale color zones.
 *   2. Modest desaturate + linear darken — pushes the nebulae deeper into
 *      "atmospheric density" rather than "space photography."
 *   3. Add back a sparse pinpoint star layer over the blurred base — these
 *      are programmatically generated so they're crisp 1-2px points rather
 *      than the soft blurred remnants of the original photo.
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const SRC = 'static/backgrounds/space_prepolish.png';
const DST = 'static/backgrounds/space.png';

const meta = await sharp(SRC).metadata();
const W = meta.width;
const H = meta.height;
console.log(`Source: ${W}x${H}`);

// Step 1+2: blur + tonal adjustment.
// Blur sigma 40 dissolves all small-to-medium structure; only the broad
// color zones (~10% of image width) survive as smooth gradients, which is
// exactly what we want — composition without cloud structure.
const base = await sharp(SRC)
  .blur(40)
  .linear(0.92, -2)                 // gentle darkening — preserve enough atmosphere to feel
  .modulate({ saturation: 0.85 })   // retain color identity, just less "wallpaper"
  .toBuffer();

// Step 3: generate sparse pinpoint stars.
// Density = ~1 star per 22000 px². Distribution is uniform random.
// Brightness is heavily biased toward dim — only ~3% are "bright" stars.
const STAR_DENSITY = 1 / 22000;
const numStars = Math.round(W * H * STAR_DENSITY);
console.log(`Stars: ${numStars}`);

// Build a star overlay PNG via a raw Buffer.
// 4 channels (RGBA), all zero (transparent black) by default.
const overlay = Buffer.alloc(W * H * 4, 0);

// Seeded RNG so output is deterministic across runs
let seed = 0x9e3779b9;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) | 0;
  return ((seed >>> 0) / 0xffffffff);
};

const setPx = (x, y, r, g, b, a) => {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  // Composite over what's already there using max (additive-ish for bright pinpoints)
  overlay[i]     = Math.max(overlay[i],     r);
  overlay[i + 1] = Math.max(overlay[i + 1], g);
  overlay[i + 2] = Math.max(overlay[i + 2], b);
  overlay[i + 3] = Math.max(overlay[i + 3], a);
};

for (let s = 0; s < numStars; s++) {
  const x = Math.floor(rand() * W);
  const y = Math.floor(rand() * H);

  // Brightness distribution: heavily skewed dim.
  // 70% dim (12-30 alpha), 27% medium (35-65), 3% bright (75-130).
  const r = rand();
  let alpha;
  if (r < 0.70)      alpha = 12 + Math.floor(rand() * 18);
  else if (r < 0.97) alpha = 35 + Math.floor(rand() * 30);
  else               alpha = 75 + Math.floor(rand() * 55);

  // Slight color tint: most stars white, some faintly cool.
  const tintRoll = rand();
  let cr = 255, cg = 255, cb = 255;
  if (tintRoll < 0.18) { cr = 220; cg = 230; cb = 255; } // cool blue
  else if (tintRoll < 0.22) { cr = 255; cg = 240; cb = 220; } // warm tint (rare)

  // Bright stars: a 1-pixel core only — no halos to avoid "decorative sparkle"
  setPx(x, y, cr, cg, cb, alpha);
  if (alpha > 70) {
    // Tiny bleed for the ~3% bright stars: 4 cardinal neighbors at much lower alpha.
    const bleed = Math.floor(alpha * 0.18);
    setPx(x + 1, y, cr, cg, cb, bleed);
    setPx(x - 1, y, cr, cg, cb, bleed);
    setPx(x, y + 1, cr, cg, cb, bleed);
    setPx(x, y - 1, cr, cg, cb, bleed);
  }
}

const starLayer = await sharp(overlay, {
  raw: { width: W, height: H, channels: 4 },
}).png().toBuffer();

// Final: composite stars over blurred+toned base.
await sharp(base)
  .composite([{ input: starLayer, blend: 'over' }])
  .png({ compressionLevel: 9 })
  .toFile(DST);

console.log('Wrote', DST);
