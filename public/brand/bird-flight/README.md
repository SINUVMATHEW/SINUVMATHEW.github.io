# Crowned bird flight frames

These are 15 transparent PNG frames derived from the portfolio's white crowned-bird logo with the built-in imagegen tool. The generated 5 × 3 pose sheet was cleaned of stray transparent pixels and split into aligned frames. The original header logo was not replaced.

- Frames: `flight-01.png` through `flight-15.png`
- Each frame: 360 × 350 px, RGBA with transparent background
- Sprite strip: `bird-flight-strip.png`, 5400 × 350 px
- Playback order: 01 → 15 → 01
- Suggested duration: 1.2 seconds per loop

## CSS usage

```css
.bird-flight {
  width: 48px;
  height: 47px;
  background: url('/brand/bird-flight-strip.png') no-repeat 0 0;
  background-size: 1500% 100%;
  animation: bird-flight 1.2s steps(15, end) infinite;
}
@keyframes bird-flight {
  to { background-position: 107.142857% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .bird-flight { animation-play-state: paused; }
}
```

The 107.142857% end position is intentional: it advances by exactly one of the 15 frame widths per step, with no two-frame bleed.

## Generation prompt

Built-in imagegen, transparent output, reference image: `public/legacy-assets/logo.png`.

> Use case: precise-object-edit. Create a production-ready transparent sprite sheet for a tiny website companion, based closely on the attached WHITE BIRD LOGO. Exactly 15 frames in a rigid 5 columns × 3 rows grid, reading left to right, top to bottom. Each cell contains just one complete bird, same size and same position. Keep the logo's recognizable crowned head, beak pointing right, compact curved body, smooth swept wing and long tapered tail; simplify to a CLEAN FLAT WHITE SILHOUETTE with only very subtle light-gray linework. This is a stylized logo character, not a naturalistic dove, not photoreal. Animate a simple cycle of wing poses: frames 1-3 raised, 4-6 horizontal, 7-9 lowered, 10-12 horizontal, 13-15 raised. Keep head, crown, body, tail fixed and consistent so the animation does not jitter. Absolutely transparent empty background in every cell, with no black, white, gray, or checkerboard texture; no dust, speckles, glow, shadow, frame, box, grid lines, text, numbers, or extra decorations. Uniform generous transparent margins around each bird; no birds touch one another or the edges. High-contrast, crisp and usable at 40 pixels tall.

The output is a stylized interpretation of the original mark. The website header currently retains the exact original logo.
