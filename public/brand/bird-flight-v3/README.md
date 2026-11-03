# Crowned bird flight — realistic artwork / v3

Generated with the built-in imagegen tool from the Exult logo and prior bird animation, then separated into body, near-wing and far-wing layers. The existing 36-frame timing is retained: 1.2 seconds at 30 fps, downstroke 37%, recovery 63%, far wing delayed about 2 frames.

Assets: flight-01.png through flight-36.png (400 × 390, transparent); bird-flight-v3-strip.webp (recommended for the website, 14,400 × 390); bird-flight-v3-strip.png (lossless); body.png, near-wing.png, far-wing.png; artwork-source.png; manifest.json.

CSS example:
```css
.bird-flight {
  width: 66px;
  aspect-ratio: 400 / 390;
  background: url("/brand/bird-flight-v3-strip.webp") 0 0 / 3600% 100% no-repeat;
  animation: flight 1.8s steps(36, end) infinite;
}
@keyframes flight { to { background-position: 102.857143% 0; } }
@media (prefers-reduced-motion: reduce) {
.bird-flight { animation-play-state: paused; }
}
```

The portfolio companion uses the WebP strip during flight and bird-perched.webp as a still folded-wing pose at rest. The artwork mirrors horizontally for leftward travel. The companion animation is explicitly enabled as requested; the other site motion preferences are unchanged. Preview: /brand/bird-flight-v3-preview.html.

Imagegen prompt: Create a transparent, anatomically believable pearly white crowned dove based on the Exult logo; preserve the right-facing silhouette, small crown and sweeping tail; layered feathers, subtle sculptural shading, no text or background. A second imagegen pass created separated body and wing parts for the motion rig.

Wing attachment correction: the wing roots are centered on the rotation pivots and positioned on the shoulder. Downstroke/recovery curves, far-wing delay, fold, bob and 36-frame timing are unchanged.

Website flight behavior: the existing 36 poses play over 1.8 seconds. Travel takes 3.2–5.2 seconds along curved paths with gentle sway and banking. Scroll selection waits 240 ms before changing perch; a new target starts from the current bird position. The folded-wing pose is motionless after landing.
