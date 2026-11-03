import { useEffect, useRef } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const mix = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);

export default function BirdCompanion() {
  const birdRef = useRef(null);

  useEffect(() => {
    const bird = birdRef.current;
    const logo = document.querySelector('.logo__image');
    if (!bird || !logo) return undefined;
    let activeStop = null;
    let placementFrame = 0;
    let flightFrame = 0;
    let scrollTimer = 0;
    let lastScroll = 0;
    let flying = false;
    let position = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };

    const touchTarget = bird.querySelector('.bird-companion__touch');
    const featherLayer = document.createElement('div');
    featherLayer.className = 'bird-feather-shower';
    featherLayer.setAttribute('aria-hidden', 'true');
    document.body.append(featherLayer);
    const bursts = new Map();
    let petTimer = 0;

    const stopHover = () => bird.classList.remove('is-hovering');
    const startHover = event => {
      if (event.pointerType === 'touch') return;
      bird.classList.add('is-hovering');
    };
    const onFocus = () => {
      if (touchTarget.matches(':focus-visible')) bird.classList.add('is-hovering');
    };
    const removeBurst = burst => {
      window.clearTimeout(bursts.get(burst));
      bursts.delete(burst);
      burst.remove();
    };
    const showerFeathers = event => {
      event.preventDefault();
      event.stopPropagation();
      if (!bird.classList.contains('is-visible')) return;
      while (bursts.size >= 3) removeBurst(bursts.keys().next().value);
      bird.classList.add('is-petted');
      window.clearTimeout(petTimer);
      petTimer = window.setTimeout(() => bird.classList.remove('is-petted'), 1800);

      const bounds = bird.getBoundingClientRect();
      const origin = {
        x: bounds.left + bounds.width * .55,
        y: bounds.top + bounds.height * .48,
      };
      const burst = document.createElement('div');
      burst.className = 'bird-feather-burst';
      for (let index = 0; index < 16; index++) {
        const feather = document.createElement('span');
        feather.className = 'bird-feather';
        const direction = index % 2 ? 1 : -1;
        feather.style.left = origin.x + 'px';
        feather.style.top = origin.y + 'px';
        feather.style.setProperty('--feather-dx', direction * (25 + Math.random() * 105) + 'px');
        feather.style.setProperty('--feather-fall', 110 + Math.random() * 140 + 'px');
        feather.style.setProperty('--feather-lift', 20 + Math.random() * 48 + 'px');
        feather.style.setProperty('--feather-turn', direction * (90 + Math.random() * 170) + 'deg');
        feather.style.setProperty('--feather-angle', -70 + Math.random() * 140 + 'deg');
        feather.style.setProperty('--feather-size', 11 + Math.random() * 8 + 'px');
        feather.style.animationDuration = 2.5 + Math.random() * .7 + 's';
        feather.style.animationDelay = index * .018 + 's';
        feather.innerHTML = '<svg viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 44C-1 34 1 15 16 2C27 18 22 34 9 44Z" fill="#f5f6f3" stroke="#ced9e4" stroke-width=".7"/><path d="M7 47C11 34 14 20 16 7M11 35L5 28M13 27L6 20M15 19L11 14M12 32L19 27M14 23L21 18" stroke="#a8b9ca" stroke-width=".85" stroke-linecap="round"/></svg>';
        burst.append(feather);
      }
      featherLayer.append(burst);
      bursts.set(burst, window.setTimeout(() => removeBurst(burst), 3800));
    };
    touchTarget.addEventListener('pointerenter', startHover);
    touchTarget.addEventListener('pointerleave', stopHover);
    touchTarget.addEventListener('focus', onFocus);
    touchTarget.addEventListener('blur', stopHover);
    touchTarget.addEventListener('click', showerFeathers);

    const setPosition = point => {
      position = point;
      bird.style.setProperty('--bird-x', point.x + 'px');
      bird.style.setProperty('--bird-y', point.y + 'px');
    };
    const perchPosition = target => {
      const bounds = target.getBoundingClientRect();
      const width = bird.offsetWidth;
      const height = bird.offsetHeight;
      return {
        x: bounds.left + Math.min(bounds.width * 0.5, 145) - width / 2,
        y: bounds.top - height * 0.7 + 2,
      };
    };
    const land = () => {
      window.cancelAnimationFrame(flightFrame);
      flying = false;
      velocity = { x: 0, y: 0 };
      bird.classList.remove('is-flying');
      bird.style.setProperty('--bird-tilt', '0deg');
      bird.dataset.state = 'perched';
      if (activeStop?.isConnected) setPosition(perchPosition(activeStop));
    };

    const flyTo = target => {
      window.cancelAnimationFrame(flightFrame);
      activeStop = target;
      const from = { ...position };
      let destination = perchPosition(target);
      const distance = Math.hypot(destination.x - from.x, destination.y - from.y);
      const duration = clamp(3000 + distance * 2.2, 3200, 5200);
      const start = performance.now();
      let lastTime = start;
      let lastFlip = start;
      const initialDirection = Math.abs(destination.x - from.x) > 12
        ? Math.sign(destination.x - from.x)
        : bird.classList.contains('is-facing-left') ? -1 : 1;
      bird.classList.toggle('is-facing-left', initialDirection < 0);
      const lift = Math.min(110, Math.max(48, distance * 0.17));
      const tangent = Math.abs(velocity.x) > 15 ? Math.sign(velocity.x) : initialDirection;
      const control = {
        x: from.x + tangent * Math.min(140, distance * 0.3 + 35),
        y: from.y - lift,
      };
      flying = true;
      bird.classList.add('is-visible', 'is-flying');
      touchTarget.tabIndex = 0;
      bird.dataset.state = 'flying';
      bird.dataset.perch = target.dataset.birdStop;
      bird.dataset.flightDuration = String(Math.round(duration));

      const travel = now => {
        if (!activeStop?.isConnected) {
          land();
          return;
        }
        const dt = clamp((now - lastTime) / 1000, .001, .05);
        lastTime = now;
        const actualEnd = perchPosition(activeStop);
        const tracking = 1 - Math.exp(-4 * dt);
        destination = {
          x: mix(destination.x, actualEnd.x, tracking),
          y: mix(destination.y, actualEnd.y, tracking),
        };
        const progress = clamp((now - start) / duration, 0, 1);
        const t = smooth(progress);
        const inv = 1 - t;
        const approach = {
          x: destination.x - initialDirection * Math.min(100, distance * .2 + 30),
          y: destination.y - lift * .7,
        };
        const envelope = Math.sin(Math.PI * progress);
        const next = {
          x: inv ** 3 * from.x + 3 * inv ** 2 * t * control.x + 3 * inv * t ** 2 * approach.x + t ** 3 * destination.x
            + Math.sin(progress * Math.PI * 3) * envelope * 16,
          y: inv ** 3 * from.y + 3 * inv ** 2 * t * control.y + 3 * inv * t ** 2 * approach.y + t ** 3 * destination.y
            + Math.sin(progress * Math.PI * 4) * envelope * 8,
        };
        velocity = { x: (next.x - position.x) / dt, y: (next.y - position.y) / dt };
        if (Math.abs(velocity.x) > 16 && progress < .85 && now - lastFlip > 260) {
          const left = velocity.x < 0;
          if (left !== bird.classList.contains('is-facing-left')) {
            bird.classList.toggle('is-facing-left', left);
            lastFlip = now;
          }
        }
        const facing = bird.classList.contains('is-facing-left') ? -1 : 1;
        const tilt = clamp(Math.atan2(velocity.y, Math.max(55, Math.abs(velocity.x))) * 180 / Math.PI, -12, 12);
        bird.style.setProperty('--bird-tilt', (tilt * facing * envelope).toFixed(2) + 'deg');
        setPosition(next);

        if (progress < 1) {
          flightFrame = window.requestAnimationFrame(travel);
        } else if (Math.hypot(actualEnd.x - position.x, actualEnd.y - position.y) < 6 && now - lastScroll > 250) {
          land();
        } else {
          // A moving page can leave the bird behind. Curve toward the new perch
          // from the current position rather than snapping to it.
          flyTo(activeStop);
        }
      };
      flightFrame = window.requestAnimationFrame(travel);
    };

    const home = () => {
      window.cancelAnimationFrame(flightFrame);
      flying = false;
      activeStop = null;
      bird.classList.remove('is-visible', 'is-flying', 'is-facing-left', 'is-hovering', 'is-petted');
      touchTarget.tabIndex = -1;
      window.clearTimeout(petTimer);
      bird.style.setProperty('--bird-tilt', '0deg');
      bird.dataset.state = 'home';
      const bounds = logo.getBoundingClientRect();
      setPosition({
        x: bounds.left + bounds.width / 2 - bird.offsetWidth / 2,
        y: bounds.top + bounds.height / 2 - bird.offsetHeight / 2,
      });
    };

    const choosePerch = () => {
      if (window.scrollY <= 100) {
        home();
        return;
      }
      const focusY = Math.min(innerHeight * .48, 470);
      const stops = [...document.querySelectorAll('[data-bird-stop]')]
        .filter(node => node.getClientRects().length && node.getBoundingClientRect().bottom > 130);
      if (!stops.length) return;
      const visible = stops.filter(node => node.getBoundingClientRect().top < innerHeight - 60);
      const candidates = visible.length ? visible : stops;
      const score = node => Math.abs(node.getBoundingClientRect().top - focusY)
        + (node.dataset.birdStop === 'gallery' ? 40 : 0);
      let target = candidates.reduce((best, node) => score(node) < score(best) ? node : best);
      if (activeStop && candidates.includes(activeStop) && score(activeStop) < score(target) + 80) target = activeStop;
      if (target !== activeStop) flyTo(target);
      else if (!flying) setPosition(perchPosition(target));
    };

    const onScroll = () => {
      lastScroll = performance.now();
      window.clearTimeout(scrollTimer);
      window.cancelAnimationFrame(placementFrame);
      placementFrame = window.requestAnimationFrame(() => {
        if (window.scrollY <= 100) home();
        else if (!flying && activeStop?.isConnected) setPosition(perchPosition(activeStop));
      });
      scrollTimer = window.setTimeout(choosePerch, 240);
    };
    const onResize = () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(choosePerch, 180);
    };
    const gallery = document.querySelector('.design-grid');
    const observer = new MutationObserver(onResize);
    if (gallery) observer.observe(gallery, { childList: true });
    choosePerch();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(placementFrame);
      window.cancelAnimationFrame(flightFrame);
      window.clearTimeout(scrollTimer);
      observer.disconnect();
      window.clearTimeout(petTimer);
      touchTarget.removeEventListener('pointerenter', startHover);
      touchTarget.removeEventListener('pointerleave', stopHover);
      touchTarget.removeEventListener('focus', onFocus);
      touchTarget.removeEventListener('blur', stopHover);
      touchTarget.removeEventListener('click', showerFeathers);
      for (const burst of [...bursts.keys()]) removeBurst(burst);
      featherLayer.remove();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="bird-companion" ref={birdRef}>
      <button className="bird-companion__touch" type="button" tabIndex={-1} aria-label="Pet the bird and shower feathers" title="Pet the bird" />
      <span className="bird-companion__art" aria-hidden="true">
        <img className="bird-companion__perched" src="/brand/bird-flight-v3/bird-perched.webp" alt="" />
        <span className="bird-companion__flight" />
      </span>
    </div>
  );
}
