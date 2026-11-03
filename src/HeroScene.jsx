import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './hero-scene.css';

const disposeModel = root => root.traverse(child => {
  child.geometry?.dispose();
  const materials = Array.isArray(child.material) ? child.material : [child.material];
  materials.forEach(material => {
    if (!material) return;
    Object.values(material).forEach(value => { if (value?.isTexture) value.dispose(); });
    material.dispose();
  });
});

const birdPalette = {
  Body: ['#f8f4ed', '#647b9a'],
  ChestFeathers: ['#fffaf2', '#a3b2cb'],
  WingFeathers_R: ['#bfd3f4', '#7188b8'],
  WingFeathers_L: ['#bfd3f4', '#7188b8'],
  WingCoverts: ['#ded1f2', '#9d86c4'],
  Tail: ['#b9e0e9', '#759dbb'],
  Beak: ['#eee0cd', '#b48f75'],
  Feet: ['#dfd6ca', '#9c83a0'],
  Crown: ['#efd493', '#ddaa67'],
  Pearls: ['#fff9ec', '#d9cbb1'],
  Gems: ['#a6e2ff', '#6ccbf4'],
};

export default function HeroScene() {
  const hostRef = useRef(null);
  const viewRef = useRef({ zoom: 9, orbitX: 0.04, orbitY: 0 });
  const drawRef = useRef(() => {});
  const rotationRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0, 0.12, viewRef.current.zoom);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    host.prepend(renderer.domElement);

    const bird = new THREE.Group();
    scene.add(bird);
    let model = null;
    let disposed = false;

    new GLTFLoader().load(
      '/brand/crowned_bird_1.glb',
      gltf => {
        if (disposed) {
          disposeModel(gltf.scene);
          return;
        }
        model = gltf.scene;
        model.traverse(child => {
          if (!child.isMesh || !child.material) return;
          const colors = birdPalette[child.name];
          if (!colors) return;
          const tint = material => {
            const next = material.clone();
            next.color.set(colors[0]);
            next.emissive.set(colors[1]);
            next.emissiveIntensity = child.name === 'Gems' ? 0.24 : 0.065;
            next.roughness = child.name === 'Crown' || child.name === 'Gems' ? 0.32 : 0.62;
            return next;
          };
          child.material = Array.isArray(child.material) ? child.material.map(tint) : tint(child.material);
        });
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        model.position.copy(center).multiplyScalar(-1);
        bird.scale.setScalar(4.4 / Math.max(size.x, size.y));
        bird.add(model);
        host.classList.add('three-scene--loaded');
        if (reducedMotion) renderer.render(scene, camera);
      },
      undefined,
      error => console.error('Unable to load crowned bird model:', error),
    );

    scene.add(new THREE.HemisphereLight(0xf3f6ff, 0x25344a, 1.4));
    const key = new THREE.DirectionalLight(0xfff3e5, 2.45);
    key.position.set(3.5, 5, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8da7ff, 1.85);
    rim.position.set(-3, 2, -3);
    scene.add(rim);
    const cursorLight = new THREE.PointLight(0xddeeff, 12, 9, 1.6);
    cursorLight.position.set(0, 0, 4);
    scene.add(cursorLight);

    const targetRotation = new THREE.Vector2(0.04, 0);
    rotationRef.current = targetRotation;
    let dragging = null;
    let animationFrame = 0;
    let elapsed = 0;

    const draw = () => {
      if (reducedMotion) {
        bird.rotation.set(targetRotation.x, targetRotation.y, 0);
        camera.position.z = viewRef.current.zoom;
        renderer.render(scene, camera);
      }
    };
    drawRef.current = draw;
    const onPointerDown = event => {
      if (event.target.closest('button')) return;
      dragging = { id: event.pointerId, x: event.clientX, y: event.clientY, orbitX: viewRef.current.orbitX, orbitY: viewRef.current.orbitY };
      host.setPointerCapture(event.pointerId);
      host.classList.add('is-dragging');
    };
    const onPointerMove = event => {
      const bounds = host.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
      cursorLight.position.set(x * 3, y * 2.5, 4);
      host.style.setProperty('--light-x', (event.clientX - bounds.left) + 'px');
      host.style.setProperty('--light-y', (event.clientY - bounds.top) + 'px');
      if (dragging?.id === event.pointerId) {
        viewRef.current.orbitY = dragging.orbitY + (event.clientX - dragging.x) * 0.009;
        viewRef.current.orbitX = THREE.MathUtils.clamp(dragging.orbitX + (event.clientY - dragging.y) * 0.006, -1.1, 1.1);
        targetRotation.set(viewRef.current.orbitX, viewRef.current.orbitY);
      } else {
        targetRotation.set(viewRef.current.orbitX + y * 0.06, viewRef.current.orbitY + x * 0.06);
      }
      draw();
    };
    const onPointerUp = event => {
      if (dragging?.id !== event.pointerId) return;
      dragging = null;
      host.classList.remove('is-dragging');
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    };
    const onPointerLeave = () => {
      if (!dragging) targetRotation.set(viewRef.current.orbitX, viewRef.current.orbitY);
      draw();
    };
    const onKeyDown = event => {
      const step = 0.18;
      if (event.key === 'ArrowLeft') viewRef.current.orbitY -= step;
      else if (event.key === 'ArrowRight') viewRef.current.orbitY += step;
      else if (event.key === 'ArrowUp') viewRef.current.orbitX = Math.max(-1.1, viewRef.current.orbitX - step);
      else if (event.key === 'ArrowDown') viewRef.current.orbitX = Math.min(1.1, viewRef.current.orbitX + step);
      else return;
      event.preventDefault();
      targetRotation.set(viewRef.current.orbitX, viewRef.current.orbitY);
      draw();
    };

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const render = () => {
      elapsed += 0.01;
      bird.rotation.x += (targetRotation.x - bird.rotation.x) * 0.055;
      bird.rotation.y += (targetRotation.y - bird.rotation.y) * 0.055;
      bird.position.y = Math.sin(elapsed * 1.25) * 0.025;
      camera.position.z += (viewRef.current.zoom - camera.position.z) * 0.12;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };

    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerup', onPointerUp);
    host.addEventListener('pointercancel', onPointerUp);
    host.addEventListener('pointerleave', onPointerLeave);
    host.addEventListener('keydown', onKeyDown);
    if (!reducedMotion) render();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerUp);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.removeEventListener('keydown', onKeyDown);
      if (model) disposeModel(model);
      renderer.dispose();
      renderer.domElement.remove();
      drawRef.current = () => {};
      rotationRef.current = null;
    };
  }, []);

  const zoom = amount => { viewRef.current.zoom = THREE.MathUtils.clamp(viewRef.current.zoom + amount, 6.8, 12); drawRef.current(); };
  const reset = () => { viewRef.current.zoom = 9; viewRef.current.orbitX = 0.04; viewRef.current.orbitY = 0; rotationRef.current?.set(0.04, 0); drawRef.current(); };

  return <div className="three-scene three-scene--sculpture" ref={hostRef} role="group" tabIndex={0} aria-label="Interactive crowned bird sculpture. Drag to rotate, use arrow keys to rotate, or use the zoom controls.">
    <div className="scene-glow" />
    <div className="scene-controls" aria-label="Bird model controls">
      <span>Drag to rotate</span>
      <button type="button" onClick={() => zoom(-0.75)} aria-label="Zoom in on bird">+</button>
      <button type="button" onClick={() => zoom(0.75)} aria-label="Zoom out from bird">−</button>
      <button type="button" onClick={reset} aria-label="Reset bird view">Reset</button>
    </div>
  </div>;
}
