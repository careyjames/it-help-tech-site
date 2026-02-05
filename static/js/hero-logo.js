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

  const state = createConstellationState(
    logo,
    canvas,
    context,
    getReducedMotionQuery()
  );

  state.renderFrame = (timestamp) => {
    renderConstellationFrame(timestamp, state);
  };

  bindPointerEvents(state);
  bindVisibilityEvents(state);
  bindMotionPreferenceEvents(state);
  bindResizeEvents(state);
  bindIntersectionEvents(state);

  resizeConstellation(state);
  applyMotionPreference(state);
}

function getReducedMotionQuery() {
  if (typeof globalThis.matchMedia !== 'function') {
    return null;
  }
  return globalThis.matchMedia('(prefers-reduced-motion: reduce)');
}

function createConstellationState(logo, canvas, context, motionQuery) {
  return {
    logo,
    canvas,
    context,
    motionQuery,
    reducedMotion: motionQuery ? motionQuery.matches : false,
    width: 1,
    height: 1,
    dpr: 1,
    running: false,
    inView: true,
    frameHandle: 0,
    previousTimestamp: 0,
    pointerTargetX: 0,
    pointerTargetY: 0,
    pointerX: 0,
    pointerY: 0,
    nodes: [],
    renderFrame: null,
  };
}

function nodeCountForArea(area) {
  if (area <= 90000) {
    return 22;
  }
  if (area <= 160000) {
    return 26;
  }
  return 30;
}

function createNodes(count, width, height) {
  const nodes = [];
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.05 + Math.random() * 0.11;
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      depth: 0.35 + Math.random() * 0.85,
      radius: 0.75 + Math.random() * 1.25,
      gold: Math.random() < 0.3,
      ox: 0,
      oy: 0,
    });
  }
  return nodes;
}

function clampNodes(nodes, width, height) {
  for (const node of nodes) {
    node.x = Math.min(Math.max(node.x, 0), width);
    node.y = Math.min(Math.max(node.y, 0), height);
  }
}

function resizeConstellation(state) {
  const rect = state.canvas.getBoundingClientRect();
  state.width = Math.max(1, Math.floor(rect.width));
  state.height = Math.max(1, Math.floor(rect.height));
  state.dpr = Math.min(globalThis.devicePixelRatio || 1, 2);

  state.canvas.width = Math.max(1, Math.floor(state.width * state.dpr));
  state.canvas.height = Math.max(1, Math.floor(state.height * state.dpr));
  state.context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  const neededNodes = nodeCountForArea(state.width * state.height);
  if (state.nodes.length !== neededNodes) {
    state.nodes = createNodes(neededNodes, state.width, state.height);
    return;
  }

  clampNodes(state.nodes, state.width, state.height);
}

function resolveFrameScale(state, timestamp) {
  if (state.previousTimestamp === 0) {
    state.previousTimestamp = timestamp;
    return 1;
  }

  const frameScale = Math.min((timestamp - state.previousTimestamp) / 16.667, 2.2);
  state.previousTimestamp = timestamp;
  return frameScale;
}

function updatePointerSmoothing(state) {
  state.pointerX += (state.pointerTargetX - state.pointerX) * 0.05;
  state.pointerY += (state.pointerTargetY - state.pointerY) * 0.05;
}

function updateNodes(state, frameScale) {
  const parallaxX = state.pointerX * 8;
  const parallaxY = state.pointerY * 6;

  for (const node of state.nodes) {
    node.x += node.vx * frameScale;
    node.y += node.vy * frameScale;

    if (node.x < 0 || node.x > state.width) {
      node.vx *= -1;
      node.x = Math.min(Math.max(node.x, 0), state.width);
    }

    if (node.y < 0 || node.y > state.height) {
      node.vy *= -1;
      node.y = Math.min(Math.max(node.y, 0), state.height);
    }

    node.ox = node.x + parallaxX * node.depth;
    node.oy = node.y + parallaxY * node.depth;
  }
}

function drawNodeLinks(state, maxDistSq) {
  for (let index = 0; index < state.nodes.length; index += 1) {
    const a = state.nodes[index];
    for (let pair = index + 1; pair < state.nodes.length; pair += 1) {
      const b = state.nodes[pair];
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
      const alpha = intensity * (warm ? 0.24 : 0.2);

      state.context.beginPath();
      state.context.moveTo(a.ox, a.oy);
      state.context.lineTo(b.ox, b.oy);
      state.context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      state.context.lineWidth = warm ? 0.8 : 0.68;
      state.context.stroke();
    }
  }
}

function drawNodeDots(state) {
  for (const node of state.nodes) {
    const alpha = node.gold ? 0.82 : 0.72;
    const color = node.gold ? '213, 173, 54' : '97, 173, 250';
    state.context.beginPath();
    state.context.arc(node.ox, node.oy, node.radius, 0, Math.PI * 2);
    state.context.fillStyle = `rgba(${color}, ${alpha})`;
    state.context.fill();
  }
}

function renderConstellationFrame(timestamp, state) {
  if (!state.running) {
    return;
  }

  const frameScale = resolveFrameScale(state, timestamp);
  updatePointerSmoothing(state);

  state.context.clearRect(0, 0, state.width, state.height);

  const maxDist = Math.max(78, Math.min(132, state.width * 0.27));
  const maxDistSq = maxDist * maxDist;

  updateNodes(state, frameScale);
  drawNodeLinks(state, maxDistSq);
  drawNodeDots(state);

  state.frameHandle = globalThis.requestAnimationFrame(state.renderFrame);
}

function stopConstellation(state) {
  if (!state.running) {
    return;
  }

  state.running = false;
  state.previousTimestamp = 0;
  if (state.frameHandle) {
    globalThis.cancelAnimationFrame(state.frameHandle);
    state.frameHandle = 0;
  }
}

function startConstellation(state) {
  if (state.running || state.reducedMotion || !state.inView || document.hidden) {
    return;
  }

  state.running = true;
  state.previousTimestamp = 0;
  state.frameHandle = globalThis.requestAnimationFrame(state.renderFrame);
}

function applyMotionPreference(state) {
  if (state.reducedMotion) {
    stopConstellation(state);
    state.canvas.style.display = 'none';
    state.context.clearRect(0, 0, state.width, state.height);
    return;
  }

  state.canvas.style.removeProperty('display');
  resizeConstellation(state);
  startConstellation(state);
}

function updatePointerTarget(state, event) {
  const rect = state.logo.getBoundingClientRect();
  state.pointerTargetX = (event.clientX - rect.left) / rect.width - 0.5;
  state.pointerTargetY = (event.clientY - rect.top) / rect.height - 0.5;
}

function bindPointerEvents(state) {
  state.logo.addEventListener('pointermove', (event) => {
    updatePointerTarget(state, event);
  }, { passive: true });

  state.logo.addEventListener('pointerleave', () => {
    state.pointerTargetX = 0;
    state.pointerTargetY = 0;
  }, { passive: true });
}

function bindVisibilityEvents(state) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopConstellation(state);
      return;
    }
    startConstellation(state);
  });
}

function bindMotionPreferenceEvents(state) {
  if (!state.motionQuery || typeof state.motionQuery.addEventListener !== 'function') {
    return;
  }

  state.motionQuery.addEventListener('change', (event) => {
    state.reducedMotion = event.matches;
    applyMotionPreference(state);
  });
}

function bindResizeEvents(state) {
  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => {
      resizeConstellation(state);
    });
    resizeObserver.observe(state.logo);
    return;
  }

  globalThis.addEventListener(
    'resize',
    () => {
      resizeConstellation(state);
    },
    { passive: true }
  );
}

function bindIntersectionEvents(state) {
  if (typeof IntersectionObserver !== 'function') {
    return;
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      state.inView = entries[0] ? entries[0].isIntersecting : true;
      if (!state.inView) {
        stopConstellation(state);
        return;
      }
      startConstellation(state);
    },
    { threshold: 0.1 }
  );

  intersectionObserver.observe(state.logo);
}
