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
    touchDarkBoost: isTouchDarkMode(),
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

const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const INVERSE_PHI = 1 / PHI;

function matchesMediaQuery(query) {
  return typeof globalThis.matchMedia === 'function' && globalThis.matchMedia(query).matches;
}

function isTouchDarkMode() {
  const viewportWidth = Math.min(
    globalThis.innerWidth || Number.POSITIVE_INFINITY,
    (globalThis.screen && globalThis.screen.width) || Number.POSITIVE_INFINITY
  );
  return (
    (viewportWidth <= 900 || matchesMediaQuery('(pointer: coarse)')) &&
    !document.documentElement.classList.contains('switch')
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function seededSpiralPoint(index, count, width, height) {
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const maxRadius = Math.hypot(width, height) * (0.45 + INVERSE_PHI * 0.15);

  const normalized = (index + 0.5) / count;
  const radial = Math.sqrt(normalized) * maxRadius;
  const angle = index * GOLDEN_ANGLE;

  const jitterRadius = (Math.random() - 0.5) * maxRadius * 0.07;
  const jitterAngle = (Math.random() - 0.5) * 0.28;
  const offsetX = Math.cos(angle + jitterAngle) * (radial + jitterRadius);
  const offsetY = Math.sin(angle + jitterAngle) * (radial + jitterRadius);

  return {
    x: clamp(centerX + offsetX, 0, width),
    y: clamp(centerY + offsetY, 0, height),
    angle,
  };
}

function createNodes(count, width, height) {
  const nodes = [];
  for (let index = 0; index < count; index += 1) {
    const seed = seededSpiralPoint(index, count, width, height);
    const driftAngle = seed.angle + Math.PI * 0.5 + (Math.random() - 0.5) * 1.15;
    const speed = 0.048 + Math.random() * 0.108;
    nodes.push({
      x: seed.x,
      y: seed.y,
      vx: Math.cos(driftAngle) * speed,
      vy: Math.sin(driftAngle) * speed,
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
    node.x = clamp(node.x, 0, width);
    node.y = clamp(node.y, 0, height);
  }
}

function resizeConstellation(state) {
  const rect = state.canvas.getBoundingClientRect();
  state.width = Math.max(1, Math.floor(rect.width));
  state.height = Math.max(1, Math.floor(rect.height));
  state.dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  state.touchDarkBoost = isTouchDarkMode();

  state.canvas.width = Math.max(1, Math.floor(state.width * state.dpr));
  state.canvas.height = Math.max(1, Math.floor(state.height * state.dpr));
  state.context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  const baseNodeCount = nodeCountForArea(state.width * state.height);
  const neededNodes = state.touchDarkBoost ? baseNodeCount + 1 : baseNodeCount;
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
      node.x = clamp(node.x, 0, state.width);
    }

    if (node.y < 0 || node.y > state.height) {
      node.vy *= -1;
      node.y = clamp(node.y, 0, state.height);
    }

    node.ox = node.x + parallaxX * node.depth;
    node.oy = node.y + parallaxY * node.depth;
  }
}

function drawNodeLinks(state, maxDistSq) {
  for (let index = 0; index < state.nodes.length; index += 1) {
    const a = state.nodes[index];
    for (let pair = index + 1; pair < state.nodes.length; pair += 1) {
      drawNodeLink(state, a, state.nodes[pair], maxDistSq, state.touchDarkBoost);
    }
  }
}

function drawFixedLink(state, a, b, strokeStyle, lineWidth) {
  state.context.beginPath();
  state.context.moveTo(a.ox, a.oy);
  state.context.lineTo(b.ox, b.oy);
  state.context.strokeStyle = strokeStyle;
  state.context.lineWidth = lineWidth;
  state.context.stroke();
}

function drawPhyllotaxisLinks(state) {
  if (!state.touchDarkBoost || state.nodes.length < 4) {
    return;
  }

  for (let index = 0; index < state.nodes.length - 2; index += 1) {
    if (index % 8 !== 0) {
      continue;
    }

    drawFixedLink(
      state,
      state.nodes[index],
      state.nodes[index + 1],
      'rgba(164, 220, 255, 0.09)',
      0.62
    );
  }
}

function drawNodeLink(state, a, b, maxDistSq, touchDarkBoost) {
  const distSq = linkDistanceSquared(a, b);
  if (distSq > maxDistSq) {
    return;
  }

  const intensity = 1 - distSq / maxDistSq;
  const style = resolveNodeLinkStyle(a, b, intensity, touchDarkBoost);

  state.context.beginPath();
  state.context.moveTo(a.ox, a.oy);
  state.context.lineTo(b.ox, b.oy);
  state.context.strokeStyle = style.strokeStyle;
  state.context.lineWidth = style.lineWidth;
  state.context.stroke();
}

function linkDistanceSquared(a, b) {
  const dx = a.ox - b.ox;
  const dy = a.oy - b.oy;
  return dx * dx + dy * dy;
}

function resolveNodeLinkStyle(a, b, intensity, touchDarkBoost) {
  const warm = touchDarkBoost ? a.gold && b.gold : a.gold || b.gold;
  const red = touchDarkBoost ? (warm ? 232 : 105) : warm ? 207 : 84;
  const green = touchDarkBoost ? (warm ? 198 : 186) : warm ? 173 : 154;
  const blue = touchDarkBoost ? (warm ? 116 : 244) : warm ? 105 : 229;
  const alphaScale = touchDarkBoost ? 1.24 : 1;
  const widthScale = touchDarkBoost ? 1.15 : 1;
  const alpha = Math.min(1, intensity * (warm ? 0.24 : 0.2) * alphaScale);
  return {
    strokeStyle: `rgba(${red}, ${green}, ${blue}, ${alpha})`,
    lineWidth: (warm ? 0.82 : 0.7) * widthScale,
  };
}

function drawNodeDots(state) {
  const alphaBoost = state.touchDarkBoost ? 1.08 : 1;
  const radiusBoost = state.touchDarkBoost ? 1.08 : 1;
  for (const node of state.nodes) {
    const alpha = Math.min(1, (node.gold ? 0.82 : 0.72) * alphaBoost);
    const color = state.touchDarkBoost
      ? node.gold
        ? '255, 223, 138'
        : '156, 214, 255'
      : node.gold
        ? '213, 173, 54'
        : '97, 173, 250';
    state.context.beginPath();
    state.context.arc(node.ox, node.oy, node.radius * radiusBoost, 0, Math.PI * 2);
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

  const baseMaxDist = Math.max(78, Math.min(132, state.width * 0.27));
  const maxDist = state.touchDarkBoost ? baseMaxDist * 1.15 : baseMaxDist;
  const maxDistSq = maxDist * maxDist;

  updateNodes(state, frameScale);
  drawNodeLinks(state, maxDistSq);
  drawPhyllotaxisLinks(state);
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
  if (state.running || state.reducedMotion || document.hidden) {
    return;
  }

  if (!state.touchDarkBoost && !state.inView) {
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
  if (typeof IntersectionObserver !== 'function' || state.touchDarkBoost) {
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
