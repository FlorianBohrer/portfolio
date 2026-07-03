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
    if (el.dataset.de === undefined) el.dataset.de = el.textContent; // capture German once
    el.textContent = next === "en" ? el.dataset.en : el.dataset.de;
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
      ".section-label, .project-head, .project-desc, .shot, .about-grid, .big-mail, .contact-links, .skill-group, .focus-row"
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

/* ---------- focus demo · rotating wireframe icosahedron (pure canvas, no libs) ---------- */
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

  let W = 0, H = 0, DPR = 1, raf = 0, running = false, t0 = 0;

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth || 260;
    H = canvas.clientHeight || Math.round(W * 0.667);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function render(ax, ay) {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.34;
    const sx = Math.sin(ax), cxr = Math.cos(ax), sy = Math.sin(ay), cyr = Math.cos(ay);
    const pts = V.map(([x, y, z]) => {
      const x1 = x * cyr - z * sy, z1 = x * sy + z * cyr; // rotate Y
      const y2 = y * cxr - z1 * sx, z2 = y * sx + z1 * cxr; // rotate X
      const p = 3 / (3 + z2); // perspective
      return [cx + x1 * R * p, cy + y2 * R * p, z2];
    });
    ctx.lineCap = "round";
    ctx.strokeStyle = stroke;
    for (const [i, j] of E) {
      const za = (pts[i][2] + pts[j][2]) / 2;
      ctx.globalAlpha = 0.26 + 0.62 * ((za + 2) / 4); // far edges fainter
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[j][0], pts[j][1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = stroke;
    for (const p of pts) { ctx.beginPath(); ctx.arc(p[0], p[1], 1.7, 0, 6.29); ctx.fill(); }
  }

  function frame(t) {
    if (!t0) t0 = t;
    const a = (t - t0) * 0.00042;
    render(a * 0.62, a);
    if (running) raf = requestAnimationFrame(frame);
  }

  const start = () => { if (!running && !reduce) { running = true; t0 = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  resize();
  window.addEventListener("resize", () => { resize(); if (reduce) render(0.5, 0.75); }, { passive: true });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  if (reduce) {
    render(0.5, 0.75);
  } else if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(canvas);
  } else {
    start();
  }
})();
