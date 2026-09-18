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

const route = document.querySelector('#hero-route');
const orb = document.querySelector('#flow-orb');
const routeNodes = [...document.querySelectorAll('[data-route-node]')];
const routeLabels = [...document.querySelectorAll('.node-label')];

if (route && orb) {
  const stageFractions = [0, 0.235, 0.535, 0.79, 1];
  const moveMs = 1250;
  const holdMs = 620;
  let stage = 0;
  let stageStarted = performance.now();
  const length = route.getTotalLength();

  const paintStage = (activeStage) => {
    routeNodes.forEach((node, index) => {
      node.classList.toggle('active', index === activeStage);
      node.classList.toggle('passed', index < activeStage);
    });
    routeLabels.forEach((label, index) => label.classList.toggle('active', index === activeStage));
  };

  const setOrb = (fraction) => {
    const point = route.getPointAtLength(length * Math.max(0, Math.min(1, fraction)));
    orb.setAttribute('cx', point.x);
    orb.setAttribute('cy', point.y);
  };

  if (reducedMotion) {
    setOrb(1);
    routeNodes.forEach((node) => node.classList.add('passed'));
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
