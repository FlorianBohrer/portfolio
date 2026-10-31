/* current year */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- theme: optional dark mode (persisted, follows the OS, pretty crossfade) ---------- */
const THEME_KEY = "theme";
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function resolvedTheme() {
  return localStorage.getItem(THEME_KEY) || (prefersDark.matches ? "dark" : "light");
}
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  if (themeColorMeta) themeColorMeta.content = t === "dark" ? "#181510" : "#f4f0e8";
  document
    .querySelectorAll(".theme-toggle")
    .forEach((b) => b.setAttribute("aria-pressed", String(t === "dark")));
  window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
}
applyTheme(resolvedTheme());

document.querySelectorAll(".theme-toggle").forEach((btn) =>
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    const swap = () => applyTheme(next);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduce) document.startViewTransition(swap);
    else swap();
  })
);
// keep following the OS setting until the user explicitly picks a theme
prefersDark.addEventListener("change", () => {
  if (!localStorage.getItem(THEME_KEY)) applyTheme(resolvedTheme());
});

/* ---------- language toggle (DE / EN) ---------- */
let lang = localStorage.getItem("lang") === "en" ? "en" : "de";

function applyLang(next) {
  lang = next;
  document.documentElement.lang = next;
  document.querySelectorAll("[data-en]").forEach((el) => {
    if (el.dataset.de === undefined) el.dataset.de = el.innerHTML; // capture German once (keep inline markup like <br> and the honey span)
    if (next === "en") el.textContent = el.dataset.en;
    else el.innerHTML = el.dataset.de;
  });
  // alt text and aria-labels are content too — leaving them German in EN mode
  // strands exactly the screen-reader users the rest of the page caters to
  document.querySelectorAll("[data-en-alt]").forEach((el) => {
    if (el.dataset.deAlt === undefined) el.dataset.deAlt = el.alt;
    el.alt = next === "en" ? el.dataset.enAlt : el.dataset.deAlt;
  });
  document.querySelectorAll("[data-en-label]").forEach((el) => {
    if (el.dataset.deLabel === undefined) el.dataset.deLabel = el.getAttribute("aria-label");
    el.setAttribute("aria-label", next === "en" ? el.dataset.enLabel : el.dataset.deLabel);
  });
  document.querySelectorAll(".lang-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.lang === next)
  );
  localStorage.setItem("lang", next);
  tickClock();
}

document.querySelectorAll(".lang-btn").forEach((b) =>
  b.addEventListener("click", () => applyLang(b.dataset.lang))
);

/* ---------- Bozen local time ---------- */
const clockEl = document.getElementById("clock");
function tickClock() {
  if (!clockEl) return;
  const t = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(new Date());
  clockEl.textContent = lang === "en" ? t : `${t} Uhr`;
}

applyLang(lang); // sets language + first clock render
setInterval(tickClock, 20000);

/* ---------- animated header background: flowing streamlines (ink on paper) ---------- */
(() => {
  const canvas = document.getElementById("hero-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: false });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // rgb palettes per theme (approximate the OKLCH tokens); swapped on theme change
  let PAPER, INK, ACCENT, HONEY;
  function setPalette() {
    const dark = document.documentElement.dataset.theme === "dark";
    PAPER = dark ? [24, 21, 16] : [244, 240, 231];
    INK = dark ? [238, 232, 222] : [46, 39, 33];
    ACCENT = dark ? [214, 132, 90] : [176, 98, 60];
    HONEY = dark ? [235, 196, 104] : [230, 190, 92];
  }
  setPalette();

  let W = 0, H = 0, DPR = 1, running = false, raf = 0;
  const mouse = { x: -9999, y: -9999, active: false };

  const flow = (x, y, t) =>
    (Math.sin(x * 0.0015 + t * 0.00028) + Math.cos(y * 0.0018 - t * 0.00022) + Math.sin((x + y) * 0.0009 + t * 0.00035)) * 1.65;

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth; H = canvas.clientHeight || Math.round(window.innerHeight);
    canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = `rgb(${PAPER})`; ctx.fillRect(0, 0, W, H);
  }

  function draw(t) {
    ctx.fillStyle = `rgb(${PAPER})`; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = "round";
    const step = Math.max(48, Math.round(W / 26));
    let idx = 0;
    for (let sy = -30; sy < H + 30; sy += step) {
      for (let sx = -30; sx < W + 30; sx += step) {
        idx++;
        let x = sx, y = sy;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let s = 0; s < 34; s++) {
          let a = flow(x, y, t);
          if (mouse.active) {
            const dx = x - mouse.x, dy = y - mouse.y, d = Math.hypot(dx, dy);
            if (d < 220) a += (1 - d / 220) * 2.8; // bend streamlines around the cursor
          }
          x += Math.cos(a) * 9;
          y += Math.sin(a) * 9;
          ctx.lineTo(x, y);
        }
        const c = (idx * 0.137) % 1;
        let col = INK, al = 0.1, lw = 1;
        if (c > 0.9) { col = HONEY; al = 0.26; lw = 1.4; }
        else if (c > 0.74) { col = ACCENT; al = 0.17; lw = 1.3; }
        ctx.lineWidth = lw;
        ctx.strokeStyle = `rgba(${col},${al})`;
        ctx.stroke();
      }
    }
  }

  function frame(t) {
    if (!running) return;
    draw(t);
    raf = requestAnimationFrame(frame);
  }

  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("themechange", () => {
    setPalette();
    resize(); // repaint the base colour immediately
    if (reduce) draw(2000); // static mode redraws once; animated mode picks it up next frame
  });
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY - canvas.getBoundingClientRect().top;
    mouse.active = true;
  }, { passive: true });
  window.addEventListener("pointerleave", () => (mouse.active = false));
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  if (!reduce) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(canvas);
    }
    start();
  } else {
    draw(2000); // one calm static frame
  }
})();

/* ---------- topbar hairline on scroll ---------- */
const topbar = document.querySelector(".topbar");
const onScroll = () => topbar?.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- scrollspy — active nav link ---------- */
const navLinks = new Map(
  [...document.querySelectorAll(".topnav a")]
    .filter((a) => a.getAttribute("href")?.startsWith("#"))
    .map((a) => [a.getAttribute("href").slice(1), a])
);
if ("IntersectionObserver" in window && navLinks.size) {
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active"));
          navLinks.get(e.target.id)?.classList.add("active");
        }
      }
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
}

/* ---------- scroll reveal for the rest of the page (safe, JS-gated, no trap) ---------- */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = [
    ...document.querySelectorAll(
      ".section-label, .project-head, .project-desc, .shot, .about-grid, .big-mail, .contact-links, .skill-group, .focus-lead, .focus-card"
    ),
  ];
  targets.forEach((el) => el.classList.add("reveal"));
  if (reduce || !("IntersectionObserver" in window)) return; // leave everything visible

  targets.forEach((el) => el.classList.add("pre")); // hide all reveal targets (all sit below the hero)
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.remove("pre");
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
  );
  targets.forEach((el) => io.observe(el));

  // failsafe: never leave anything hidden, even if the observer misbehaves
  setTimeout(() => targets.forEach((el) => el.classList.remove("pre")), 2500);
})();

/* ---------- click a skill → jump to the related project (+ brief highlight) ---------- */
(() => {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  document.querySelectorAll("[data-jump]").forEach((chip) => {
    const jump = () => {
      const target = document.getElementById(chip.dataset.jump);
      if (!target) return;
      target.scrollIntoView({ behavior, block: "start" });
      target.classList.remove("flash");
      void target.offsetWidth; // restart the highlight animation
      target.classList.add("flash");
      setTimeout(() => target.classList.remove("flash"), 1500);
    };
    chip.addEventListener("click", jump);
    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jump(); }
    });
  });
})();

/* ---------- focus demos: only animate while on screen and the tab is visible ---------- */
function whileVisible(el, start, stop) {
  let onScreen = false;
  const sync = () => (onScreen && !document.hidden ? start() : stop());
  document.addEventListener("visibilitychange", sync);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: 0 }).observe(el);
  } else {
    onScreen = true;
    sync();
  }
}

/* ---------- focus demo 1 · draggable wireframe icosahedron (pure canvas, no libs) ---------- */
(() => {
  const canvas = document.querySelector(".ico");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stroke = getComputedStyle(canvas).getPropertyValue("--g").trim() || "oklch(62% 0.15 42)";

  const PHI = (1 + Math.sqrt(5)) / 2;
  // 12 vertices = cyclic permutations of (0, ±1, ±φ)
  const V = [
    [0, 1, PHI], [0, 1, -PHI], [0, -1, PHI], [0, -1, -PHI],
    [1, PHI, 0], [1, -PHI, 0], [-1, PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, 1], [-PHI, 0, -1],
  ];
  // 30 edges = vertex pairs at squared distance 4
  const E = [];
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++) {
      const dx = V[i][0] - V[j][0], dy = V[i][1] - V[j][1], dz = V[i][2] - V[j][2];
      if (Math.abs(dx * dx + dy * dy + dz * dz - 4) < 1e-3) E.push([i, j]);
    }

  // idle spin in rad/ms; a drag hands over its own velocity, which then eases back to idle
  const IDLE_X = 0.00026, IDLE_Y = 0.00042, MAX_V = 0.02;
  let W = 0, H = 0, DPR = 1, raf = 0, running = false, last = 0;
  let ax = 0.5, ay = 0.75, vx = IDLE_X, vy = IDLE_Y, drag = null;

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth || 260;
    H = canvas.clientHeight || Math.round(W * 0.667);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.17;
    const sx = Math.sin(ax), cxr = Math.cos(ax), sy = Math.sin(ay), cyr = Math.cos(ay);
    const pts = V.map(([x, y, z]) => {
      const x1 = x * cyr - z * sy, z1 = x * sy + z * cyr; // rotate Y
      const y2 = y * cxr - z1 * sx, z2 = y * sx + z1 * cxr; // rotate X
      const p = 6 / (6 + z2); // perspective (+z is away from the viewer)
      return [cx + x1 * R * p, cy + y2 * R * p, z2];
    });
    const near = (z) => (2 - z) / 4; // 0 at the back, 1 at the front
    ctx.lineCap = "round";
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.3;
    for (const [i, j] of E) {
      ctx.globalAlpha = 0.16 + 0.74 * near((pts[i][2] + pts[j][2]) / 2); // far edges fainter
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[j][0], pts[j][1]);
      ctx.stroke();
    }
    ctx.fillStyle = stroke;
    for (const p of pts) {
      ctx.globalAlpha = 0.4 + 0.6 * near(p[2]);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 1.2 + 1.6 * near(p[2]), 0, 6.29);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(t) {
    const dt = Math.min(48, last ? t - last : 16);
    last = t;
    if (!drag) {
      const k = 1 - Math.pow(0.998, dt); // frame-rate independent ease back to the idle spin
      vx += (IDLE_X - vx) * k;
      vy += (IDLE_Y - vy) * k;
      ax += vx * dt;
      ay += vy * dt;
    }
    render();
    if (running) raf = requestAnimationFrame(frame);
  }

  const start = () => { if (!running && !reduce) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const clamp = (v) => Math.max(-MAX_V, Math.min(MAX_V, v));

  /* drag to rotate; let go and it keeps the fling, then settles back into its idle spin */
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    canvas.parentElement.classList.add("touched");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.x) * 0.01, dy = (e.clientY - drag.y) * 0.01;
    const dt = Math.max(1, e.timeStamp - drag.t);
    ay += dx;
    ax += dy;
    vy = clamp(dx / dt);
    vx = clamp(dy / dt);
    drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    if (reduce) render(); // no animation loop: direct manipulation only
  });
  const release = (e) => {
    if (!drag) return;
    if (e.timeStamp - drag.t > 80) vx = vy = 0; // held still before letting go: no fling
    drag = null;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  resize();
  render();
  window.addEventListener("resize", () => { resize(); render(); }, { passive: true });
  if (!reduce) whileVisible(canvas, start, stop);
})();

/* ---------- focus demo 2 · data packets travelling sensor → hub → view ---------- */
(() => {
  const demo = document.querySelector(".demo-graph");
  if (!demo) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = demo.querySelector("svg");
  const layer = svg.querySelector(".packets");
  const nodes = [...svg.querySelectorAll(".node")];
  const pos = nodes.map((n) => [+n.getAttribute("cx"), +n.getAttribute("cy")]);
  const baseR = nodes.map((n) => +n.getAttribute("r"));
  const heat = nodes.map(() => 0);
  const INS = [0, 1, 2], HUB = 3, OUTS = [4, 5];
  const NS = "http://www.w3.org/2000/svg";
  const SEG_MS = 720; // time per edge

  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const ease = (f) => f * f * (3 - 2 * f);
  // position along the two-edge route at t ∈ [0, 2)
  const at = (route, t) => {
    const s = t < 1 ? 0 : 1, f = ease(t - s);
    const a = pos[route[s]], b = pos[route[s + 1]];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  };
  const place = (el, [x, y]) => { el.setAttribute("cx", x.toFixed(1)); el.setAttribute("cy", y.toFixed(1)); };
  const dot = (r, opacity) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", r);
    if (opacity) c.setAttribute("opacity", opacity);
    layer.appendChild(c);
    return c;
  };

  if (reduce) {
    // one calm still: a few packets mid-flight, nothing moves on its own
    [[[0, HUB, 4], 0.55], [[2, HUB, 5], 0.3], [[1, HUB, 4], 1.45]].forEach(([route, t]) => place(dot(2.6), at(route, t)));
    demo.querySelector(".demo-hint").hidden = true;
    return;
  }

  let packets = [], raf = 0, running = false, last = 0, nextSpawn = 0;
  const spawn = (startAt) => packets.push({ route: [pick(INS), HUB, pick(OUTS)], startAt, t: 0, head: null, tail: null, hub: false });

  function frame(now) {
    const dt = Math.min(48, last ? now - last : 16);
    last = now;
    if (now >= nextSpawn) {
      spawn(now);
      nextSpawn = now + 520 + Math.random() * 560;
    }
    packets = packets.filter((p) => {
      if (now < p.startAt) return true; // queued by a click burst
      if (!p.head) {
        p.tail = dot(1.6, 0.35);
        p.head = dot(2.6);
        heat[p.route[0]] = 1; // the source node fires as the packet leaves
      } else p.t += dt / SEG_MS;
      if (!p.hub && p.t >= 1) { p.hub = true; heat[HUB] = 1; }
      if (p.t >= 2) {
        heat[p.route[2]] = 1;
        p.head.remove();
        p.tail.remove();
        return false;
      }
      place(p.head, at(p.route, p.t));
      place(p.tail, at(p.route, Math.max(0, p.t - 0.09)));
      return true;
    });
    const decay = Math.pow(0.995, dt);
    nodes.forEach((n, i) => {
      if (heat[i] < 0.01 && !n.style.fill) return;
      heat[i] = heat[i] < 0.01 ? 0 : heat[i] * decay;
      n.setAttribute("r", (baseR[i] + heat[i] * 2.4).toFixed(2));
      n.style.fill = heat[i] ? `color-mix(in oklab, var(--g) ${Math.round(heat[i] * 70)}%, var(--paper-2))` : "";
    });
    if (running) raf = requestAnimationFrame(frame);
  }

  const start = () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  // click / tap: send a burst of data through the graph
  demo.addEventListener("click", () => {
    const now = performance.now();
    for (let i = 0; i < 6; i++) spawn(now + i * 90);
    demo.classList.add("touched");
  });

  whileVisible(demo, start, stop);
})();

/* ---------- focus demo 3 · live frame rate of the visitor's own browser ---------- */
(() => {
  const demo = document.querySelector(".demo-fps");
  if (!demo) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const valEl = demo.querySelector(".fps-val");
  const msEl = demo.querySelector(".fps-ms");
  const arc = demo.querySelector(".fps-ring .arc");
  const line = demo.querySelector(".fps-spark polyline");
  const C = 289; // ring circumference, 2π · 46
  const N = 90; // frames kept for the frame-time graph
  const RATES = [30, 50, 60, 75, 90, 100, 120, 144, 165, 240];
  const samples = [];
  let hz = 60, raf = 0, running = false, last = 0, lastPaint = 0;

  function paint() {
    const recent = samples.slice(-30);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const fps = 1000 / avg;
    // the display's refresh rate is the best sustained rate seen, snapped to a real panel rate
    const snapped = RATES.reduce((a, b) => (Math.abs(b - fps) < Math.abs(a - fps) ? b : a));
    if (snapped > hz) hz = snapped;
    valEl.textContent = Math.round(Math.min(fps, hz));
    msEl.textContent = `${avg.toFixed(1)} ms`;
    arc.style.strokeDashoffset = (C * (1 - Math.min(1, fps / hz))).toFixed(1);
  }

  // frame-time graph: a flat line when smooth, spikes upward on every dropped frame
  function spark() {
    const budget = 1000 / hz, off = N - samples.length;
    line.setAttribute(
      "points",
      samples.map((dt, i) => `${(((i + off) / (N - 1)) * 120).toFixed(1)},${(28 - Math.min(1, dt / (3 * budget)) * 26).toFixed(1)}`).join(" ")
    );
  }

  function frame(t) {
    if (last) {
      samples.push(t - last);
      if (samples.length > N) samples.shift();
    }
    last = t;
    if (samples.length > 5 && t - lastPaint > (reduce ? 1000 : 250)) {
      lastPaint = t;
      paint();
    }
    if (!reduce) spark();
    if (running) raf = requestAnimationFrame(frame);
  }

  // last = 0 on every start, so time spent off screen never counts as a slow frame
  const start = () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  whileVisible(demo, start, stop);
})();

/* ---------- 3D tilt + glare on screenshots, magnetic hover on links (fine pointers only) ---------- */
(() => {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduce) return;

  /* screenshots tilt toward the cursor, with a soft glare that follows it */
  document.querySelectorAll(".shot").forEach((shot) => {
    const glare = document.createElement("span");
    glare.className = "glare";
    glare.setAttribute("aria-hidden", "true");
    shot.appendChild(glare);
    let raf = 0, rx = 0, ry = 0, hover = false;
    const render = () => {
      raf = 0;
      shot.style.transform = hover
        ? `perspective(900px) translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`
        : "";
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(render); };
    shot.addEventListener("pointerenter", () => { hover = true; shot.classList.add("tilting"); });
    shot.addEventListener("pointermove", (e) => {
      const r = shot.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry = (px - 0.5) * 10;
      rx = (0.5 - py) * 8;
      shot.style.setProperty("--gx", `${px * 100}%`);
      shot.style.setProperty("--gy", `${py * 100}%`);
      queue();
    });
    shot.addEventListener("pointerleave", () => {
      hover = false;
      shot.classList.remove("tilting"); // stylesheet transition eases the spring-back
      queue();
    });
  });

  /* focus cards: a spotlight follows the cursor across the card and along its rim */
  document.querySelectorAll(".focus-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* links and buttons lean toward the cursor while hovered */
  document
    .querySelectorAll(".project-link, .intro-links a, .contact-links a, .theme-toggle, .big-mail, .to-top")
    .forEach((el) => {
      el.classList.add("magnetic");
      let raf = 0, mx = 0, my = 0;
      const render = () => {
        raf = 0;
        el.style.transform = mx || my ? `translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px)` : "";
      };
      const queue = () => { if (!raf) raf = requestAnimationFrame(render); };
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        mx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        my = (e.clientY - (r.top + r.height / 2)) * 0.32;
        queue();
      });
      el.addEventListener("pointerleave", () => { mx = my = 0; queue(); });
    });
})();

/* ---------- lightbox: view project shots full screen ---------- */
(() => {
  const shots = [...document.querySelectorAll(".shot img, .shot2 img")];
  if (!shots.length || !HTMLDialogElement.prototype.showModal) return;

  // navigate within the project you clicked in, not across the whole page
  const groupOf = (img) => img.closest("article.project") || document;
  const galleryFor = (img) => [...groupOf(img).querySelectorAll(".shot img, .shot2 img")];

  const dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.innerHTML = `
    <div class="lb-stage">
      <button class="lb-btn lb-full" type="button" aria-label="Vollbild" data-en-label="Full screen">
        <svg class="i-expand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3m8 0h3a2 2 0 002-2v-3"/></svg>
        <svg class="i-compress" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3M3 16h3a2 2 0 012 2v3m8 0v-3a2 2 0 012-2h3"/></svg>
      </button>
      <button class="lb-btn lb-close" type="button" aria-label="Schließen" data-en-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <div class="lb-frame">
        <button class="lb-btn lb-nav lb-prev" type="button" aria-label="Vorheriges Bild" data-en-label="Previous image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <img class="lb-img" alt="" />
        <button class="lb-btn lb-nav lb-next" type="button" aria-label="Nächstes Bild" data-en-label="Next image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <div class="lb-bar">
        <p class="lb-cap"></p>
        <span class="lb-count mono"></span>
      </div>
    </div>`;
  document.body.appendChild(dlg);
  applyLang(lang); // the overlay is built after the first pass, so localise its labels now

  const img = dlg.querySelector(".lb-img");
  const cap = dlg.querySelector(".lb-cap");
  const count = dlg.querySelector(".lb-count");
  const prevBtn = dlg.querySelector(".lb-prev");
  const nextBtn = dlg.querySelector(".lb-next");

  let gallery = [], i = 0, opener = null;

  function show(n) {
    i = (n + gallery.length) % gallery.length;
    const src = gallery[i];
    img.src = src.currentSrc || src.src;
    img.alt = src.alt || "";
    cap.textContent = src.alt || "";
    count.textContent = `${i + 1} / ${gallery.length}`;
    const solo = gallery.length < 2;
    prevBtn.hidden = nextBtn.hidden = solo;
    count.hidden = solo;
    [i + 1, i - 1].forEach((k) => { // warm the neighbours so paging feels instant
      const nb = gallery[(k + gallery.length) % gallery.length];
      if (nb) new Image().src = nb.currentSrc || nb.src;
    });
  }

  function open(src) {
    gallery = galleryFor(src);
    opener = src;
    show(gallery.indexOf(src));
    dlg.showModal();
    document.body.style.overflow = "hidden";
    dlg.querySelector(".lb-close").focus();
  }

  shots.forEach((s) => {
    s.addEventListener("click", () => open(s));
    // the shots are plain <img>; give them a keyboard route in too
    s.tabIndex = 0;
    s.setAttribute("role", "button");
    s.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(s); }
    });
  });

  /* real full screen: the overlay alone still leaves the browser chrome in place */
  const fullBtn = dlg.querySelector(".lb-full");
  // Chrome rejects requestFullscreen() on <dialog> ("Dialog elements are invalid"),
  // so the stage inside it goes full screen instead
  const stage = dlg.querySelector(".lb-stage");
  const reqFull = stage.requestFullscreen || stage.webkitRequestFullscreen;
  const exitFull = document.exitFullscreen || document.webkitExitFullscreen;
  const fullEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  if (!reqFull) fullBtn.hidden = true; // iOS Safari only does this for <video>

  function toggleFull() {
    if (!reqFull) return;
    if (fullEl()) exitFull.call(document);
    else reqFull.call(stage).catch(() => {}); // a denied request must not break paging
  }
  function syncFull() {
    const on = !!fullEl();
    dlg.classList.toggle("is-full", on);
    fullBtn.setAttribute("aria-pressed", String(on));
  }
  fullBtn.addEventListener("click", toggleFull);
  document.addEventListener("fullscreenchange", syncFull);
  document.addEventListener("webkitfullscreenchange", syncFull);

  prevBtn.addEventListener("click", () => show(i - 1));
  nextBtn.addEventListener("click", () => show(i + 1));
  img.addEventListener("click", () => dlg.close());
  dlg.querySelector(".lb-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.classList.contains("lb-frame")) dlg.close(); });

  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); show(i + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); show(i - 1); }
    else if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleFull(); }
  });

  // swipe between shots on touch
  let x0 = null;
  dlg.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") x0 = e.clientX; });
  dlg.addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 45) show(dx < 0 ? i + 1 : i - 1);
  });

  dlg.addEventListener("close", () => {
    if (fullEl()) exitFull.call(document);
    document.body.style.overflow = "";
    img.removeAttribute("src");
    opener?.focus(); // hand focus back to the shot that was opened
  });
})();
