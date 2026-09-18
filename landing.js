const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const reveals = [...document.querySelectorAll('.reveal')];
if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((node) => node.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((node) => revealObserver.observe(node));
}

const sequence = document.querySelector('[data-sequence]');
if (sequence && !reducedMotion) {
  const cards = [...sequence.querySelectorAll('[data-seq]')];
  const connectors = [...sequence.querySelectorAll('.stage-connector')];
  const sequenceObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    cards.forEach((card, index) => {
      window.setTimeout(() => {
        card.classList.add('sequence-active');
        if (index > 0) connectors[index - 1]?.classList.add('active');
      }, index * 520);
    });
    sequenceObserver.disconnect();
  }, { threshold: 0.34 });
  sequenceObserver.observe(sequence);
} else if (sequence) {
  sequence.querySelectorAll('[data-seq], .stage-connector').forEach((node) => node.classList.add('sequence-active', 'active'));
}

const flowVisual = document.querySelector('.flow-visual');
const route = document.querySelector('#hero-route');
const orb = document.querySelector('#flow-orb');
const routeNodes = [...document.querySelectorAll('[data-route-node]')];
const routeLabels = [...document.querySelectorAll('[data-node-label]')];

const desktopOffsets = [
  { dx: 28, dy: 22, ax: 0, ay: 0 },
  { dx: 26, dy: -24, ax: 0, ay: 1 },
  { dx: 0, dy: -30, ax: 0.5, ay: 1 },
  { dx: 24, dy: 24, ax: 0, ay: 0 },
  { dx: -24, dy: -28, ax: 1, ay: 1 },
];
const mobileOffsets = [
  { dx: 18, dy: 16, ax: 0, ay: 0 },
  { dx: 18, dy: -16, ax: 0, ay: 1 },
  { dx: 0, dy: -20, ax: 0.5, ay: 1 },
  { dx: -14, dy: 18, ax: 1, ay: 0 },
  { dx: -16, dy: -18, ax: 1, ay: 1 },
];

function positionRouteLabels() {
  if (!flowVisual || !routeNodes.length || !routeLabels.length) return;
  const visualRect = flowVisual.getBoundingClientRect();
  const compact = visualRect.width <= 560;
  const offsets = compact ? mobileOffsets : desktopOffsets;

  const measurements = routeLabels.map((label) => {
    const index = Number(label.dataset.nodeLabel);
    const node = routeNodes.find((candidate) => Number(candidate.dataset.routeNode) === index);
    if (!node) return null;
    const nodeRect = node.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    return {
      label,
      index,
      x: nodeRect.left + nodeRect.width / 2 - visualRect.left,
      y: nodeRect.top + nodeRect.height / 2 - visualRect.top,
      width: labelRect.width,
      height: labelRect.height,
    };
  }).filter(Boolean);

  for (const item of measurements) {
    const offset = offsets[item.index] || desktopOffsets[item.index] || { dx: 18, dy: 18, ax: 0, ay: 0 };
    const left = item.x + offset.dx - item.width * offset.ax;
    const top = item.y + offset.dy - item.height * offset.ay;
    item.label.style.left = `${Math.round(left)}px`;
    item.label.style.top = `${Math.round(top)}px`;
  }
}

let labelLayoutFrame = 0;
function scheduleRouteLabelPosition() {
  if (labelLayoutFrame) cancelAnimationFrame(labelLayoutFrame);
  labelLayoutFrame = requestAnimationFrame(() => {
    labelLayoutFrame = 0;
    positionRouteLabels();
  });
}

if (flowVisual && routeLabels.length) {
  scheduleRouteLabelPosition();
  if (document.fonts?.ready) document.fonts.ready.then(scheduleRouteLabelPosition);
  window.addEventListener('resize', scheduleRouteLabelPosition, { passive: true });
  if ('ResizeObserver' in window) {
    const labelResizeObserver = new ResizeObserver(scheduleRouteLabelPosition);
    labelResizeObserver.observe(flowVisual);
  }
}

if (route && orb) {
  const stageFractions = [0, 0.235, 0.535, 0.79, 1];
  const moveMs = 1250;
  const holdMs = 620;
  let stage = 0;
  let stageStarted = performance.now();
  const length = route.getTotalLength();

  const paintStage = (activeStage) => {
    routeNodes.forEach((node) => {
      const index = Number(node.dataset.routeNode);
      node.classList.toggle('active', index === activeStage);
      node.classList.toggle('passed', index < activeStage);
    });
    routeLabels.forEach((label) => {
      label.classList.toggle('active', Number(label.dataset.nodeLabel) === activeStage);
    });
  };

  const setOrb = (fraction) => {
    const point = route.getPointAtLength(length * Math.max(0, Math.min(1, fraction)));
    orb.setAttribute('cx', point.x);
    orb.setAttribute('cy', point.y);
  };

  if (reducedMotion) {
    setOrb(1);
    routeNodes.forEach((node) => node.classList.add('passed'));
    routeLabels.forEach((label) => label.classList.add('passed'));
  } else {
    paintStage(0);
    const tick = (now) => {
      const nextStage = (stage + 1) % stageFractions.length;
      const elapsed = now - stageStarted;

      if (elapsed < holdMs) {
        setOrb(stageFractions[stage]);
      } else {
        const moveElapsed = elapsed - holdMs;
        const t = Math.min(1, moveElapsed / moveMs);
        const eased = 1 - Math.pow(1 - t, 3);
        const from = stageFractions[stage];
        const to = nextStage === 0 ? 1 : stageFractions[nextStage];
        setOrb(from + (to - from) * eased);

        if (t >= 1) {
          if (nextStage === 0) {
            stage = 0;
            setOrb(0);
          } else {
            stage = nextStage;
          }
          paintStage(stage);
          stageStarted = now;
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

const header = document.querySelector('.site-header');
if (header) {
  const syncHeader = () => header.classList.toggle('scrolled', window.scrollY > 28);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
}
