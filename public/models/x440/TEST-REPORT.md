# X440 asset verification — 3 November 2026

Scope: the four new GLB files and the separate model collection preview, not a fresh audit of every portfolio feature.

## File checks

| File | Bytes | Triangles | Mesh primitives | Validator errors / warnings |
|---|---:|---:|---:|---:|
| x440-bike-master.glb | 9,546,900 | 294,444 | 98 | 0 / 0 |
| x440-bike-web.glb | 1,009,008 | 131,852 | 98 | 0 / 0 |
| x440-engine-master.glb | 3,283,312 | 102,818 | 44 | 0 / 0 |
| x440-engine-web.glb | 360,576 | 44,010 | 44 | 0 / 0 |

The Khronos validator reports one informational notice for each web file because that validator does not inspect the Meshopt extension itself. The compressed files were additionally decoded with Meshopt using glTF-Transform and loaded in the actual Three.js browser viewer. The zero error/warning count should not be read as a dimensional or artistic fidelity certification.

The model checks verify:

- All position, normal, index and animation accessor values are finite.
- Every referenced texture is embedded.
- Required assembly names remain available after optimization.
- Each engine has six animation channels with a continuous four-second loop.
- Web exports remain below 30% of master download size and below 60% of master triangle count.

`npm run models:check`: passed for all four models and both optimization budgets.

## Browser checks

The locally served preview uses the exported files through GLTFLoader, not the procedural generator in memory.

- Motorcycle and engine selection, web and master quality loading: checked.
- Drag orbit, scroll zoom and camera reset: checked.
- Side-view preset and three-quarter framing: checked.
- Engine casing transparency and embedded mechanism animation: checked.
- Engine explosion slider and reassembly: checked.
- Wireframe display and turntable: checked.
- Responsive layout: 390 × 844 and 1440 × 900 were exercised. The phone layout had a document width of 375 CSS pixels within the 390-pixel viewport, including the browser scrollbar; no horizontal overflow was observed. Controls stack below the viewer on the phone.
- The preview console showed no errors or warnings in the checks recorded for the new viewer.

Corrections made after visual inspection included decal orientation/placement, smoother tyre shoulders, spark-plug cable attachment, more visible engine hardware and piston separation in the exploded view.

## Rendering and loading

The viewer only loads the selected model and quality level. It disposes the previous model on switching, renders a cached static frame when idle, and skips animation work while the tab is hidden. Display pixel ratio is capped at 1.6.

Web bike transfer size is 89.4% below the detailed master; engine size is 89.0% below its master. These savings come from reduced tessellation, deduplication, welding, removal of unused UVs, quantization and Meshopt compression.

On local loopback, individual model load/decode observations were under one second (roughly 0.05–0.30 seconds during checks). These are warm/local observations, not cold-network loading guarantees, full-page performance timings or mobile-device benchmarks. First shader compilation can be substantially slower than subsequent frames. The preview's CPU timing is measured around renderer submission; it is not a GPU profiler or a promise of 60 fps. Shadow and transparent passes increase rendered triangle/draw totals above the table's base geometry counts.

## Application checks

- TypeScript check: passed.
- Existing kinematics and state tests: 8 passed.
- Production build: passed. Vite still flags the shared Three.js core chunk as large; the model collection itself loads its model on demand. This is a bundle advisory, not a failed build.

## Limits and next improvements

These models remain reference-informed artistic approximations. There was no full photogrammetry set, manufacturing CAD, measured orthographic drawing or licensed source mesh. Unseen hardware and the engine interior are inferred. A 3D authoring-tool import and real low-end Android/iPhone GPU tests were not performed.

For a further realism pass, prioritize measured body-panel silhouettes, exact engine casting details, actual wheel/spoke profiles, improved tyre grooves and professionally baked normal/roughness/AO textures. For a constrained mobile hero, derive an additional silhouette-preserving LOD and reduce shadow cost before increasing detail. Keep the current detailed master for editing and the web assets for on-demand inspection.

The original X440 Lab simulator remains separate and links to this new collection; its entire behavior was not recertified by this asset test.
