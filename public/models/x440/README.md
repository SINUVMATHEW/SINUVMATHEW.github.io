# X440 — reference model collection

Created 3 November 2026 for Sinu V Mathew's portfolio.

These are **original, reference-informed surface reconstructions**, not scanned geometry or manufacturer CAD. The supplied side, front, rear-quarter and engine photographs guide the visible proportions. The illustrated exploded plate guides the presentation of internal components; it is not treated as an authoritative engineering drawing.

## Downloads

| Asset | Web GLB | Detailed master GLB |
|---|---:|---:|
| Motorcycle | [1.01 MB · 131,852 triangles](./x440-bike-web.glb) | [9.55 MB · 294,444 triangles](./x440-bike-master.glb) |
| Engine | [361 KB · 44,010 triangles](./x440-engine-web.glb) | [3.28 MB · 102,818 triangles](./x440-engine-master.glb) |

Sizes use decimal MB/KB. The web bike has 98 mesh primitives; the engine has 44. Shadows and transparent surfaces add rendering passes, so these are not total per-frame draw-call counts.

Preview at `/x440-assets.html`. The viewer loads only the selected asset/quality, supports drag orbit, wheel/pinch zoom, preset cameras, wireframe, turntable and an exploded view. The engine also supports transparent casing and its embedded motion clip. The existing X440 Lab links to this separate collection; its original procedural simulation has not been replaced.

## What is included

- Motorcycle: smooth tank and seat lofts; charcoal bodywork; shaped fenders; cast alloy wheels with machined accents; tyre tread geometry; drilled discs; forks and twin coil shocks; frame and swingarm; exterior engine; header and silencer; mirrors, instruments, lamps, controls, cables, oil cooler, chain and small fasteners.
- Separate engine: finned barrel, head and rocker cover, case and removable covers, fasteners, oil lines, intake, spark plug/lead, header and shield; piston, connecting rod, crankshaft, valves/springs, camshaft and illustrative transmission gears.
- Embedded PBR metallic/roughness materials and PNG graphics. No external images, fonts or textures are required to open the GLBs.
- Six-channel engine animation named `Four-stroke study - 30 rpm`, lasting four seconds and looping through 720 degrees.
- Editable named scene nodes and local explosion offsets in glTF `extras` (Three.js `userData`).

The motorcycle contains exterior engine geometry only. Load the separate engine when someone enters the engine view, rather than loading both detailed models on the homepage.

## Coordinate and assembly contract

- Units: metres. Up: +Y. Front of bike: +X. Front/rear axle centres are 1.418 m apart.
- The motorcycle is positioned with its tyres at approximately ground level.
- The standalone engine has a presentation offset within its root. Its `engine` group is at `[0.07, 0.14, 0]`; the motorcycle's engine group is at `[0.035, 0.37, 0]`.
- Named bike groups include `fuel-tank`, `stepped-seat`, `front-wheel`, `rear-wheel`, `front-fork`, `rear-suspension`, `side-panels`, `engine`, `silencer`, `brakes` and `headlamp`.
- Named engine groups include `crankcase`, `clutch-cover`, `alternator-cover`, `cylinder-assembly`, `cylinder-barrel`, `cylinder-head`, `rocker-cover`, `piston`, `connecting-rod`, `crankshaft`, `intake-valve`, `exhaust-valve`, `camshaft` and `transmission-gears`.
- For explosions, save each group's initial local position, then add `userData.explode * progress`. Do not add offsets cumulatively every frame. Stop the mechanism clip while manually exploding moving parts. Parent and child assembly offsets are additive.

## Three.js loading

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { AnimationMixer } from 'three';

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const bike = await loader.loadAsync('/models/x440/x440-bike-web.glb');
scene.add(bike.scene);

// Load separately only when the engine view is requested.
const engine = await loader.loadAsync('/models/x440/x440-engine-web.glb');
const mixer = new AnimationMixer(engine.scene);
mixer.clipAction(engine.animations[0]).play();
// In the active engine render loop: mixer.update(deltaSeconds).
```

Web files use `EXT_meshopt_compression` and `KHR_mesh_quantization`, so configure MeshoptDecoder before loading. Detailed masters do not use mesh compression and are preferable for editing/import into a 3D authoring tool. Both variants retain their materials, images and assembly names. Use ACES tone mapping, sRGB output and an environment map for metal reflections; glTF files do not contain the preview's studio environment or lighting.

For React Three Fiber, use a GLTFLoader configured with the same decoder, or Drei's `useGLTF` with Meshopt support. Dispose geometries, materials and textures when switching models, and uncache animation mixers. Pause animation when the page is hidden. Avoid mounting two full-quality versions simultaneously.

## Optimization and verification

- Detail-specific tessellation preserves silhouette while reducing web triangle counts by 55.2% for the bike and 57.2% for the engine.
- Geometry is merged by material **inside each assembly**. Assembly transforms remain editable.
- Repeated data is deduplicated, vertices welded, unused UVs removed, and web geometry quantized and Meshopt compressed.
- Download reduction versus masters: bike **89.4%**, engine **89.0%**.
- All four files passed Khronos glTF Validator with **zero errors and zero warnings**. Validation JSON files and `manifest.json` are included.
- Asset checks verify finite geometry values, embedded textures, named assemblies, reduced web budgets and a continuous six-channel engine loop.
- Browser verification covers real GLB loading, both quality levels, orbit/zoom, camera presets, wireframe, turntable, engine transparency/animation and explosion/reset. See `TEST-REPORT.md` for the final observations and limitations.

## Fidelity limits

The model is an artistic reconstruction with simplified surfaces and hardware. It does not reproduce every weld, tread cut, casting, decal, connector, bracket or hidden component. Unsupplied views are inferred. Materials use procedural surfaces and embedded graphic decals, without a scan-derived texture or baked normal/AO atlas. It should not be described as a photogrammetric or exact photoreal replica.

Internal layouts, gears, cam profiles, valve timing and connecting-rod length are illustrative. The animation uses a 44.2 mm crank radius and an assumed 145 mm rod, with idealized intake/exhaust timing; it is not a service diagram, simulation of combustion, or validated engineering assembly. Graphics are recreated approximations. Harley-Davidson names and marks identify the subject; this is an independent portfolio study, not an affiliated product.

## Rebuilding

In the portfolio checkout, run `npm run models:export` and `npm run models:check`. The source is `scripts/x440-geometry.mjs`; export, material embedding, compression and validation are handled by `scripts/export-x440.mjs`. Dependencies are recorded in the project's package files. No paid model service or third-party motorcycle mesh is used.
