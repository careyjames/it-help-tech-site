globalThis.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo-container');
  if (!logo) {
    return;
  }

  initLogoTilt(logo);
  initConstellation(logo);
});

function initLogoTilt(logo) {
  const reducedMotion =
    typeof globalThis.matchMedia === 'function' &&
    globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || typeof logo.animate !== 'function') {
    return;
  }

  let tiltAnim;
  const setTilt = (transform) => {
    if (tiltAnim) {
      tiltAnim.cancel();
    }
    tiltAnim = logo.animate([{ transform }], {
      duration: 100,
      fill: 'forwards',
      easing: 'ease-out',
    });
  };

  logo.addEventListener('mousemove', (event) => {
    const rect = logo.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt(`perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`);
  });
  logo.addEventListener('mouseleave', () => {
    setTilt('perspective(1000px) rotateY(0) rotateX(0)');
  });
}

function initConstellation(logo) {
  const canvas = logo.querySelector('.logo-constellation');
  if (!canvas || typeof canvas.getContext !== 'function') {
    return;
  }

  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!context) {
    return;
  }

  const motionQuery =
    typeof globalThis.matchMedia === 'function'
      ? globalThis.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  let reducedMotion = motionQuery ? motionQuery.matches : false;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let running = false;
  let inView = true;
  let frameHandle = 0;
  let previousTimestamp = 0;

  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerX = 0;
  let pointerY = 0;

  let nodes = [];

  function nextNodeCount() {
    const area = width * height;
    if (area <= 90000) {
      return 20;
    }
    if (area <= 160000) {
      return 24;
    }
    return 28;
  }

  function createNodes(count) {
    nodes = [];
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.11;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        depth: 0.35 + Math.random() * 0.85,
        radius: 0.7 + Math.random() * 1.2,
        gold: Math.random() < 0.3,
        ox: 0,
        oy: 0,
      });
    }
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(globalThis.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const needed = nextNodeCount();
    if (nodes.length !== needed) {
      createNodes(needed);
      return;
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      node.x = Math.min(Math.max(node.x, 0), width);
      node.y = Math.min(Math.max(node.y, 0), height);
    }
  }

  function drawFrame(timestamp) {
    if (!running) {
      return;
    }

    if (previousTimestamp === 0) {
      previousTimestamp = timestamp;
    }
    const frameScale = Math.min((timestamp - previousTimestamp) / 16.667, 2.2);
    previousTimestamp = timestamp;

    pointerX += (pointerTargetX - pointerX) * 0.045;
    pointerY += (pointerTargetY - pointerY) * 0.045;
    const parallaxX = pointerX * 7;
    const parallaxY = pointerY * 5;

    context.clearRect(0, 0, width, height);

    const maxDist = Math.max(72, Math.min(118, width * 0.24));
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      node.x += node.vx * frameScale;
      node.y += node.vy * frameScale;

      if (node.x < 0 || node.x > width) {
        node.vx *= -1;
        node.x = Math.min(Math.max(node.x, 0), width);
      }
      if (node.y < 0 || node.y > height) {
        node.vy *= -1;
        node.y = Math.min(Math.max(node.y, 0), height);
      }

      node.ox = node.x + parallaxX * node.depth;
      node.oy = node.y + parallaxY * node.depth;
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = a.ox - b.ox;
        const dy = a.oy - b.oy;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxDistSq) {
          continue;
        }

        const intensity = 1 - distSq / maxDistSq;
        const warm = a.gold || b.gold;
        const red = warm ? 207 : 84;
        const green = warm ? 173 : 154;
        const blue = warm ? 105 : 229;
        const alpha = intensity * (warm ? 0.19 : 0.16);

        context.beginPath();
        context.moveTo(a.ox, a.oy);
        context.lineTo(b.ox, b.oy);
        context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        context.lineWidth = warm ? 0.72 : 0.62;
        context.stroke();
      }
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const alpha = node.gold ? 0.7 : 0.62;
      const color = node.gold ? '213, 173, 54' : '97, 173, 250';
      context.beginPath();
      context.arc(node.ox, node.oy, node.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${color}, ${alpha})`;
      context.fill();
    }

    frameHandle = globalThis.requestAnimationFrame(drawFrame);
  }

  function stop() {
    if (!running) {
      return;
    }
    running = false;
    previousTimestamp = 0;
    if (frameHandle) {
      globalThis.cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    }
  }

  function start() {
    if (running || reducedMotion || !inView || document.hidden) {
      return;
    }
    running = true;
    previousTimestamp = 0;
    frameHandle = globalThis.requestAnimationFrame(drawFrame);
  }

  function applyMotionPreference() {
    if (reducedMotion) {
      stop();
      canvas.style.display = 'none';
      context.clearRect(0, 0, width, height);
      return;
    }
    canvas.style.removeProperty('display');
    resizeCanvas();
    start();
  }

  function updatePointer(event) {
    const rect = logo.getBoundingClientRect();
    pointerTargetX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerTargetY = (event.clientY - rect.top) / rect.height - 0.5;
  }

  function resetPointer() {
    pointerTargetX = 0;
    pointerTargetY = 0;
  }

  logo.addEventListener('pointermove', updatePointer, { passive: true });
  logo.addEventListener('pointerleave', resetPointer, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
      return;
    }
    start();
  });

  if (motionQuery) {
    const handleMotionChange = (event) => {
      reducedMotion = event.matches;
      applyMotionPreference();
    };
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleMotionChange);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(handleMotionChange);
    }
  }

  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(logo);
  } else {
    globalThis.addEventListener('resize', resizeCanvas, { passive: true });
  }

  if (typeof IntersectionObserver === 'function') {
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries[0] ? entries[0].isIntersecting : true;
        if (!inView) {
          stop();
          return;
        }
        start();
      },
      { threshold: 0.1 }
    );
    intersectionObserver.observe(logo);
  }

  resizeCanvas();
  applyMotionPreference();
}
