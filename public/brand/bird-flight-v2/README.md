# Crowned bird flight — version 2

36 transparent PNG frames, each 360 × 350 pixels, numbered flight-01.png through flight-36.png. One full loop is 1.2 seconds at 30 frames per second.

Motion: Wings spend about 37% of the loop on the downstroke and 63% on recovery. The far wing lags roughly two frames. The head stays steadier than the body, while the tail responds later. This is a stylized animation rig.

Use bird-flight-v2-strip.webp on the website (375 KB), bird-flight-v2-strip.png for a lossless source (969 KB), or the numbered PNGs for individual frame control. Both strips are 12960 × 350 pixels with transparency.

```css
.bird-flight {
  width: 240px;
  aspect-ratio: 360 / 350;
  background: url("/brand/bird-flight-v2-strip.webp") no-repeat;
  background-size: 3600% 100%;
  animation: bird-flight 1.2s steps(36, end) infinite;
}
@keyframes bird-flight {
  to { background-position: 102.857143% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .bird-flight { animation-play-state: paused; }
}
```

The endpoint percentage is 36 / 35 × 100, so each step aligns with one frame. Keep the 360:350 aspect ratio when resizing.

Preview: /brand/bird-flight-v2-preview.html
