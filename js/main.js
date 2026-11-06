/* Original ASCII rose bloom.
   Inspired by @jin_22ee’s Instagram reel:
   https://www.instagram.com/reel/DfWTtzwpmL4/
   The sampler and the editor text below are original — not a port. */

const DURATION = 21;

const SOURCE = `import numpy as np

TAU = 2.0 * np.pi
COLS, ROWS = 96, 64

def clamp01(u):
    return np.clip(u, 0.0, 1.0)

def ease(u):
    u = clamp01(u)
    return u * u * (3.0 - 2.0 * u)

def stem_draw(t):
    """Stem length, drawn from the crown down."""
    return ease((t - 1.0) / 3.0)

def leaves_open(t):
    return ease((t - 2.0) / 2.2)

def bloom(t):
    """Shut bud at 5.5s, open rose at 14.5s."""
    return ease((t - 5.5) / 9.0)

def sway(t):
    weight = ease((t - 6.6) / 4.5)
    return 0.29 * weight * np.sin((t - 6.6) * 0.36)

def whorl(n, radius, turn):
    k = np.arange(n)
    ang = -np.pi / 2.0 + TAU * (k / n) + turn
    arm = np.column_stack([np.cos(ang), np.sin(ang)])
    return arm * radius

def cups(openness):
    scales = [
        ease((openness - 0.00) / 0.34),
        ease((openness - 0.24) / 0.36),
        ease((openness - 0.52) / 0.40),
    ]
    rings = (
        whorl(4, 2.4 * scales[0] + 0.3, 0.15),
        whorl(6, 7.0 * scales[1] + 0.4, 0.40),
        whorl(8, 13.5 * scales[2] + 0.5, 0.10),
    )
    return rings, scales

def pointed_leaf(x, y, reach):
    u = np.clip(x / max(reach, 1e-3), 0.0, 1.0)
    half = np.sin(np.pi * u) * (0.28 * reach)
    return np.abs(y) <= half

def glitter_field(t, n=120):
    rng = np.random.default_rng(7)
    xy = rng.random((n, 2))
    phase = rng.random(n) * TAU
    delay = 0.3 + rng.random(n) * 10.0
    alive = clamp01((t - delay) / 1.3)
    twinkle = np.sin(t * 2.2 + phase) ** 2
    return xy, alive * twinkle

def compose(t):
    stem = stem_draw(t)
    leaves = leaves_open(t)
    open_amt = bloom(t)
    lean = sway(t)
    rings, scales = cups(open_amt)
    specks = glitter_field(t)
    return stem, leaves, open_amt, lean, rings, specks

def main():
    t = 0.0
    while t < 21.0:
        compose(t)
        t += 1.0 / 30.0

if __name__ == "__main__":
    main()
`;

const LINES = SOURCE.split("\n");
const BLOOM_AT = Math.max(0, LINES.findIndex((line) => line.startsWith("def bloom(")));
const LINE0 = 84;

const FILL = ["@", "%", "#", "&", "8", "W", "M", "$", "0", "o", "*", "+", "=", "B", "Q", "d", "p"];
const EDGE = ["/", "\\", "(", ")", "[", "]", "{", "}", "<", ">", "|", "^", "~", "v"];
const STEM = ["|", "8", "0", "1", "I", "/", "\\", "l"];
const LEAF = ["%", "&", "8", "0", "o", "/", "\\", "(", ")", "#", "+", "~", "w", "m"];

/* ang, dist, long, short, delay, layer — y grows downward, rot follows ang */
const PETALS = [
  [-Math.PI / 2, 1.2, 6.4, 3.5, 0.0, 0],
  [-2.15, 2.5, 5.8, 3.1, 0.0, 0],
  [-0.99, 2.5, 5.8, 3.1, 0.0, 0],
  [-Math.PI / 2, 3.3, 6.0, 3.6, 0.05, 0],
  [-2.55, 3.5, 5.2, 2.9, 0.08, 0],
  [-0.59, 3.5, 5.2, 2.9, 0.08, 0],

  [-Math.PI / 2, 5.4, 7.6, 4.6, 0.16, 1],
  [-2.25, 6.0, 7.0, 3.9, 0.2, 1],
  [-0.89, 6.0, 7.0, 3.9, 0.2, 1],
  [-2.75, 6.8, 6.4, 3.5, 0.28, 1],
  [-0.39, 6.8, 6.4, 3.5, 0.28, 1],
  [Math.PI, 6.4, 5.8, 3.3, 0.32, 1],
  [0.06, 6.4, 5.8, 3.3, 0.32, 1],
  [0.72, 5.6, 5.4, 3.1, 0.3, 1],
  [2.42, 5.6, 5.4, 3.1, 0.3, 1],

  [-Math.PI / 2, 8.2, 6.8, 5.4, 0.42, 2],
  [-2.08, 9.6, 7.6, 4.4, 0.48, 2],
  [-1.06, 9.6, 7.6, 4.4, 0.48, 2],
  [-2.42, 11.4, 7.0, 3.9, 0.58, 2],
  [-0.72, 11.4, 7.0, 3.9, 0.58, 2],
  [Math.PI, 14.0, 8.4, 3.9, 0.68, 2],
  [0.0, 14.0, 8.4, 3.9, 0.68, 2],
  [-1.75, 12.2, 6.6, 3.7, 0.62, 2],
  [-1.39, 12.2, 6.6, 3.7, 0.62, 2],
  [-Math.PI / 2, 10.6, 6.0, 5.0, 0.52, 2],
  [0.9, 8.8, 5.8, 3.3, 0.6, 2],
  [2.24, 8.8, 5.8, 3.3, 0.6, 2],
];

const SEPAL_ANGLES = [-2.45, -1.95, -1.15, -0.72];

const params = new URLSearchParams(location.search);
const SOLID = params.has("solid");
const DEBUG = params.has("debug");

const canvas = document.getElementById("rose");
const ctx = canvas.getContext("2d", { alpha: false });
const hudEl = document.querySelector(".hud");
const editorEl = document.getElementById("editor");
const codeEl = document.getElementById("code");
const timeEl = document.getElementById("time");
const bloomEl = document.getElementById("bloom");
const swayEl = document.getElementById("sway");
const lettersEl = document.getElementById("letters");
const fpsEl = document.getElementById("fps");
const playBtn = document.getElementById("play");
const liveEl = document.getElementById("live");

const stars = makeStars(86);
const rowEls = [];
let activeRow = -1;
let letterCount = 0;
let raf = 0;
let last = 0;

let t = 0;
let paused = false;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (params.has("t")) {
  t = clamp(parseFloat(params.get("t")) || 0, 0, DURATION);
  paused = params.get("play") !== "1";
} else if (reduceMotion) {
  t = 16.8;
  paused = true;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function ease(u) {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
}

function lerp(a, b, u) {
  return a + (b - a) * u;
}

function hash(x, y) {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}

function glyph(pool, h) {
  return pool[h % pool.length];
}

function stemAmount(time) {
  return ease((time - 1) / 3);
}

function bloom01(time) {
  return clamp((time - 5.5) / 9, 0, 1);
}

function budAmount(time) {
  return ease((time - 4) / 1.5);
}

function swayDegrees(time) {
  const start = 6.6;
  if (time < start) return 0;
  const weight = ease(clamp((time - start) / 4.4, 0, 1));
  const main = 15.5 * weight * Math.sin((time - start) * 0.36);
  const flutter = 1.15 * weight * Math.sin(time * 1.65);
  return main + flutter;
}

function formatTime(time) {
  return "t " + clamp(time, 0, 99).toFixed(2).padStart(5, "0") + "s";
}

function formatSway(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  if (d < 0.005 || d > 359.995) d = 0;
  return d.toFixed(2).padStart(6, "0") + "°";
}

function formatLetters(n) {
  const s = String(Math.max(0, n | 0)).padStart(4, "0");
  return s.slice(0, -3) + "," + s.slice(-3);
}

function rgb(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, v | 0));
  return "rgb(" + c(r) + "," + c(g) + "," + c(b) + ")";
}

function mixWhite(col, f) {
  return [
    col[0] + (255 - col[0]) * f,
    col[1] + (255 - col[1]) * f,
    col[2] + (255 - col[2]) * f,
  ];
}

function ellipse(px, py, cx, cy, longR, shortR, rot) {
  const dx = px - cx;
  const dy = py - cy;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const lx = dx * c + dy * s;
  const ly = -dx * s + dy * c;
  return (lx * lx) / (longR * longR) + (ly * ly) / (shortR * shortR);
}

function focusLine(time) {
  const lastLine = LINES.length - 1;
  if (time <= 5.5) return (time / 5.5) * BLOOM_AT;
  const u = clamp((time - 5.5) / (DURATION - 5.5), 0, 1);
  return BLOOM_AT + u * (lastLine - BLOOM_AT);
}

function makeStars(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const h = hash(i + 5, 17);
    const big = h % 19 === 0;
    const mid = h % 5 === 0;
    out.push({
      x: (h % 10000) / 10000,
      y: ((h >>> 8) % 10000) / 10000 * 0.92,
      r: big ? 8 + (h % 8) : mid ? 3.2 + (h % 4) : 1.05 + (h % 3) * 0.35,
      phase: ((h >>> 3) % 628) / 100,
      speed: 0.7 + ((h >>> 11) % 180) / 70,
      delay: 0.35 + ((h >>> 6) % 1000) / 1000 * 10.5,
      tint: h % 6 === 0 ? "#ffe4ec" : h % 7 === 0 ? "#e7f2ff" : "#ffffff",
      kind: h % 3 === 0 ? "dot" : "star",
    });
  }
  return out;
}

/* ---------- editor ---------- */

const KEYWORDS = new Set(
  "def return if elif else for in import from as and or not class while True False None".split(" ")
);

function escapeHTML(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function paint(line) {
  if (/^\s*("""|''')/.test(line)) {
    return '<span class="s">' + escapeHTML(line).replace(/ /g, "&nbsp;") + "</span>";
  }
  let html = "";
  let i = 0;
  const comment = line.indexOf("#");
  const end = comment === -1 ? line.length : comment;
  while (i < end) {
    const rest = line.slice(i, end);
    let m;
    if ((m = /^(def)(\s+)([A-Za-z_][A-Za-z0-9_]*)/.exec(rest))) {
      html += '<span class="k">' + m[1] + "</span>" + m[2].replace(/ /g, "&nbsp;") +
        '<span class="fn">' + m[3] + "</span>";
      i += m[0].length;
    } else if ((m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest))) {
      const word = m[0];
      const cls = KEYWORDS.has(word) ? "k" : word === "np" ? "np" : "id";
      html += '<span class="' + cls + '">' + word + "</span>";
      i += word.length;
    } else if ((m = /^(?:\d+\.\d+|\.\d+|\d+)/.exec(rest))) {
      html += '<span class="n">' + m[0] + "</span>";
      i += m[0].length;
    } else if ((m = /^(?:"[^"]*"|'[^']*')/.exec(rest))) {
      html += '<span class="s">' + escapeHTML(m[0]) + "</span>";
      i += m[0].length;
    } else if ((m = /^\s+/.exec(rest))) {
      html += m[0].replace(/ /g, "&nbsp;");
      i += m[0].length;
    } else {
      html += '<span class="op">' + escapeHTML(line[i]) + "</span>";
      i += 1;
    }
  }
  if (comment !== -1) {
    html += '<span class="c">' + escapeHTML(line.slice(comment)).replace(/ /g, "&nbsp;") + "</span>";
  }
  html += '<span class="cursor"></span>';
  return html;
}

function buildEditor() {
  const frag = document.createDocumentFragment();
  LINES.forEach((text, i) => {
    const row = document.createElement("div");
    row.className = "row";
    const ln = document.createElement("span");
    ln.className = "ln";
    ln.textContent = String(LINE0 + i);
    const src = document.createElement("span");
    src.className = "src";
    src.innerHTML = paint(text);
    row.append(ln, src);
    frag.append(row);
    rowEls.push(row);
  });
  codeEl.append(frag);
}

function lineHeight() {
  const h = rowEls[0] ? rowEls[0].getBoundingClientRect().height : 0;
  return h > 2 ? h : 18;
}

function syncEditor(time) {
  const focus = focusLine(time);
  const idx = clamp(Math.round(focus), 0, LINES.length - 1);
  if (idx !== activeRow) {
    if (activeRow >= 0) rowEls[activeRow].classList.remove("active");
    rowEls[idx].classList.add("active");
    activeRow = idx;
  }
  const lh = lineHeight();
  const view = editorEl.clientHeight;
  const maxScroll = Math.max(0, LINES.length * lh - view);
  const scroll = clamp((focus - 2.15) * lh, 0, maxScroll);
  codeEl.style.transform = "translate3d(0," + -scroll + "px,0)";
}

/* ---------- rose ---------- */

function layout(w, h) {
  const cellH = Math.max(7.2, h / 58);
  const cellW = cellH / 1.58;
  const cols = Math.max(8, Math.floor(w / cellW));
  const rows = Math.max(8, Math.floor(h / cellH));
  const aspect = cellH / cellW;
  const W = cols;
  const H = rows * aspect;
  const hudRatio = h > 0 ? hudEl.offsetHeight / h : 0.14;
  const headY = H * 0.4;
  const topRoom = Math.max(8, headY - H * 0.03);
  const k = Math.min((W * 0.3) / 22.5, topRoom / 16.5);
  const neckY = headY + 5.4 * k;
  const floor = H * (1 - Math.max(hudRatio, 0.1) - 0.035);
  let baseY = neckY + Math.max(H * 0.3, 16 * k);
  if (baseY > floor) baseY = floor;
  return { cellW, cellH, cols, rows, aspect, W, H, baseY, neckY, headY, k, w, h };
}

function bendOf(y, sway, baseY, headY, W) {
  const span = Math.max(0, baseY - y);
  const norm = span / Math.max(8, baseY - (headY - 6));
  return Math.sin((sway * Math.PI) / 180) * norm * norm * Math.min(W * 0.085, 7.2);
}

function petalColor(layer, e, dx, dy, k, h) {
  let r;
  let g;
  let b;
  if (layer <= 0) {
    r = 118; g = 8; b = 30;
  } else if (layer === 1) {
    r = 176; g = 16; b = 42;
  } else {
    r = 206; g = 26; b = 54;
  }
  const edge = clamp((e - 0.42) / 0.58, 0, 1);
  r += (255 - r) * edge * 0.72;
  g += (84 - g) * edge * 0.85;
  b += (120 - b) * edge * 0.8;
  const dist = Math.hypot(dx, dy);
  const core = clamp(1 - dist / (6.2 * k), 0, 1);
  r *= 1 - core * 0.5;
  g *= 1 - core * 0.55;
  b *= 1 - core * 0.42;
  const light = clamp(1.05 - dx * 0.012 - dy * 0.008, 0.78, 1.22);
  const n = (h % 24) - 12;
  return [r * light + n * 0.6, g * light + n, b * light + n * 0.4];
}

function leafHit(x, y, ax, ay, angle, length, width, spread) {
  if (spread <= 0.02) return 0;
  const len = length * spread;
  if (Math.abs(x - ax) > len + 2 || Math.abs(y - ay) > len + 2) return 0;
  const dx = x - ax;
  const dy = y - ay;
  const co = Math.cos(angle);
  const si = Math.sin(angle);
  const u = dx * co + dy * si;
  const v = -dx * si + dy * co;
  if (u < -0.3 || u > len) return 0;
  const uu = u / len;
  const jag = 0.8 + (hash(x | 0, y | 0) % 100) / 320;
  const half = Math.sin(uu * Math.PI) * width * (0.62 + 0.38 * (1 - uu)) * jag;
  const curve = Math.sin(uu * Math.PI) * len * 0.07;
  const vv = Math.abs(v - curve);
  if (vv > half) return 0;
  return 1 - vv / (half + 0.001);
}

function renderRose(time) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const bw = Math.floor(w * dpr);
  const bh = Math.floor(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  const L = layout(w, h);
  const sway = swayDegrees(time);
  const g = stemAmount(time);
  const bloom = bloom01(time);
  const bud = budAmount(time);
  const breath = 1 + Math.sin(time * 0.7) * 0.01 * bloom;

  const headX = L.W * 0.5 + bendOf(L.headY, sway, L.baseY, L.headY, L.W);
  const headY = L.headY;
  const neckX = L.W * 0.5 + bendOf(L.neckY, sway, L.baseY, L.headY, L.W);
  const stemEnd = L.neckY + g * (L.baseY - L.neckY);

  ctx.font = L.cellH * 1.08 + 'px "JetBrains Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  drawStars(time, w, h);

  letterCount = 0;
  const placed = [];
  for (let i = 0; i < PETALS.length; i++) {
    const p = PETALS[i];
    const o = ease(clamp((bloom - p[4]) / 0.36, 0, 1));
    if (o < 0.06) continue;
    const dist = lerp(p[1] * 0.12, p[1], o) * L.k * breath;
    const ang = p[0];
    placed.push({
      cx: headX + Math.cos(ang) * dist,
      cy: headY + Math.sin(ang) * dist,
      longR: lerp(3.6, p[2], o) * L.k,
      shortR: lerp(2.05, p[3], o) * L.k,
      rot: lerp(-Math.PI / 2, ang, o),
      layer: p[5],
      fresh: o < 0.28 ? (1 - o / 0.28) * 0.55 : 0,
    });
  }

  const coreRx = (4.4 + bloom * 9.2) * L.k;
  const coreRy = (6.6 + bloom * 5.4) * L.k;
  const showCore = bud > 0.04;

  const span = L.baseY - L.neckY;
  const leaves = [
    { at: 0.34, ang: -0.32, len: L.W * 0.115, wid: L.W * 0.03 },
    { at: 0.6, ang: Math.PI - 0.42, len: L.W * 0.175, wid: L.W * 0.04 },
  ];

  for (let r = 0; r < L.rows; r++) {
    const y = (r + 0.5) * L.aspect;
    for (let c = 0; c < L.cols; c++) {
      const x = c + 0.5;
      const cell = sampleCell(x, y, c, r, {
        L, sway, g, bloom, bud, headX, headY, neckX, stemEnd, placed,
        coreRx, coreRy, showCore, span, leaves,
      });
      if (!cell) continue;
      letterCount++;
      if (SOLID) {
        ctx.fillStyle = rgb(cell[0], cell[1], cell[2]);
        ctx.fillRect(c * L.cellW, r * L.cellH, L.cellW + 0.4, L.cellH + 0.4);
      } else {
        ctx.fillStyle = rgb(cell[0], cell[1], cell[2]);
        ctx.fillText(cell[3], (c + 0.5) * L.cellW, (r + 0.5) * L.cellH);
      }
    }
  }

  drawBurst(time, headX * L.cellW, (headY / L.aspect) * L.cellH, w, h);
  drawMotes(time, neckX * L.cellW, (stemEnd / L.aspect) * L.cellH, w, h, g);

  if (DEBUG) {
    ctx.fillStyle = "#888";
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "cols " + L.cols + " rows " + L.rows + " k " + L.k.toFixed(2) + " letters " + letterCount,
      8,
      28
    );
  }
}

function sampleCell(x, y, c, r, S) {
  const dx = x - S.headX;
  const dy = y - S.headY;
  const near = dx * dx + dy * dy < Math.pow(26 * S.L.k, 2);

  if (near && S.showCore) {
    let top = null;
    for (let i = 0; i < S.placed.length; i++) {
      const p = S.placed[i];
      const e = ellipse(x, y, p.cx, p.cy, p.longR, p.shortR, p.rot);
      const jag = 0.92 + (hash(c, r) % 90) / 900;
      if (e > jag) continue;
      if (!top || p.layer > top.layer || (p.layer === top.layer && e < top.e)) {
        top = { e, layer: p.layer, fresh: p.fresh };
      }
    }
    if (top) {
      const h = hash(c, r);
      let col = petalColor(top.layer, top.e, dx, dy, S.L.k, h);
      if (top.e > 0.8) col = [col[0] * 0.55 + 20, col[1] * 0.45, col[2] * 0.5 + 8];
      if (top.e > 0.9 && h % 3 === 0) col = mixWhite(col, 0.55);
      if (top.fresh) col = mixWhite(col, top.fresh);
      const pool = top.e > 0.78 ? EDGE : FILL;
      return [col[0], col[1], col[2], glyph(pool, h)];
    }

    const ce = (dx * dx) / (S.coreRx * S.coreRx) + (dy * dy) / (S.coreRy * S.coreRy);
    const cjag = 0.9 + (hash(c + 3, r) % 80) / 700;
    if (ce < cjag) {
      const h = hash(c, r + 9);
      const edge = clamp(ce, 0, 1);
      let red = 78 + edge * 70 + S.bloom * 30;
      let green = 6 + edge * 18;
      let blue = 20 + edge * 16;
      const core = clamp(1 - Math.hypot(dx, dy) / (4.5 * S.L.k), 0, 1);
      red *= 1 - core * 0.35;
      green *= 1 - core * 0.4;
      if (S.bud < 1 && S.bloom < 0.05) {
        red = 64 + edge * 48;
        green = 4 + edge * 10;
        blue = 16 + edge * 12;
      }
      const fresh = S.bloom < 0.08 ? (1 - S.bud) * 0.2 : 0;
      const col = mixWhite([red, green, blue], fresh);
      return [col[0], col[1], col[2], glyph(ce > 0.75 ? EDGE : FILL, h)];
    }
  }

  if (S.bud > 0.15) {
    for (let i = 0; i < SEPAL_ANGLES.length; i++) {
      const hit = leafHit(
        x, y, S.neckX, S.L.neckY + 0.4, SEPAL_ANGLES[i],
        6.2 * S.L.k, 2.15 * S.L.k, S.bud
      );
      if (hit > 0) return leafRGB(hit, hash(c, r), 0);
    }
  }

  for (let i = 0; i < S.leaves.length; i++) {
    const leaf = S.leaves[i];
    const spread = leafSpread(S.g, leaf.at);
    if (!spread) continue;
    const ay = S.L.neckY + S.span * leaf.at;
    const ax = S.L.W * 0.5 + bendOf(ay, S.sway, S.L.baseY, S.L.headY, S.L.W);
    const hit = leafHit(x, y, ax, ay, leaf.ang, leaf.len, leaf.wid, spread);
    if (hit > 0) return leafRGB(hit, hash(c, r + 4), spread < 0.35 ? 0.45 : 0);
  }

  if (S.g > 0.01 && y >= S.L.neckY - 0.4 && y <= S.stemEnd + 0.6) {
    const cx = S.L.W * 0.5 + bendOf(y, S.sway, S.L.baseY, S.L.headY, S.L.W);
    const along = clamp((y - S.L.neckY) / Math.max(1, S.L.baseY - S.L.neckY), 0, 1);
    const half = (1.25 + along * 0.55) * (0.82 + (hash(c, r) % 18) / 70);
    const dxs = Math.abs(x - cx);
    if (dxs <= half) {
      const edge = dxs / half;
      const tip = clamp(1 - (S.stemEnd - y) / 2.2, 0, 1) * (S.g < 0.98 ? 1 : 0);
      const h = hash(c, r);
      const n = (h % 20) - 10;
      let red = 28 + tip * 90 + n * 0.4;
      let green = 150 + (1 - edge) * 95 + tip * 30 + n;
      let blue = 58 + (1 - edge) * 36 + tip * 20;
      if (edge > 0.72) {
        red *= 0.7; green *= 0.72; blue *= 0.7;
      }
      const ch = dxs < 0.55 ? (h % 5 === 0 ? "8" : "|") : glyph(STEM, h);
      return [red, green, blue, ch];
    }
  }
  return null;
}

function leafSpread(g, at) {
  if (g < at) return 0;
  return ease(clamp((g - at) / 0.2, 0, 1));
}

function leafRGB(hit, h, fresh) {
  const edge = 1 - hit;
  const n = (h % 18) - 9;
  let col = [
    36 + (1 - edge) * 40 + n * 0.5,
    145 + (1 - edge) * 85 + n,
    46 + (1 - edge) * 24,
  ];
  if (edge > 0.78) col = [col[0] * 0.65, col[1] * 0.7, col[2] * 0.6];
  if (fresh) col = mixWhite(col, fresh);
  const vein = hit > 0.82;
  return [col[0], col[1], col[2], vein ? "|" : glyph(LEAF, h)];
}

function drawStars(time, w, h) {
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const appear = ease(clamp((time - s.delay) / 1.15, 0, 1));
    if (appear <= 0) continue;
    const tw = Math.pow(Math.max(0, Math.sin(time * s.speed + s.phase)), 2);
    const alpha = appear * (0.18 + 0.82 * tw);
    if (alpha < 0.04) continue;
    const x = s.x * w;
    const y = s.y * h * 0.98;
    const scale = w / 420;
    drawGlint(x, y, s.r * scale, alpha, s.tint, s.kind);
  }
}

function drawGlint(x, y, r, alpha, tint, kind) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = tint;
  ctx.strokeStyle = tint;
  ctx.lineWidth = r > 6 ? 1.25 : 0.85;
  ctx.lineCap = "round";
  if (kind === "dot" || r < 1.7) {
    ctx.fillRect(x, y, Math.max(1.1, r), Math.max(1.1, r));
  } else {
    if (r > 6.5) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
      g.addColorStop(0, "rgba(255,255,255," + (alpha * 0.45) + ")");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = tint;
      ctx.strokeStyle = tint;
    }
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r * 1.28);
    ctx.lineTo(x, y + r * 1.28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.28);
    ctx.lineTo(x + r * 0.16, y);
    ctx.lineTo(x, y + r * 0.28);
    ctx.lineTo(x - r * 0.16, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBurst(time, x, y, w, h) {
  const life = clamp(1 - (time - 0.05) / 1.55, 0, 1);
  if (life <= 0) return;
  const eased = life * life;
  ctx.save();
  ctx.translate(x, y);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.08);
  glow.addColorStop(0, "rgba(255,255,255," + eased + ")");
  glow.addColorStop(0.35, "rgba(255,255,255," + eased * 0.28 + ")");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, h * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  const rays = 16;
  for (let i = 0; i < rays; i++) {
    const ang = -Math.PI / 2 + (i - (rays - 1) / 2) * 0.16;
    const diry = Math.sin(ang);
    const up = diry < 0 ? 1.45 : 0.42;
    const len = h * (0.035 + (i % 5) * 0.012) * up * (0.55 + eased);
    ctx.globalAlpha = eased * (0.25 + (i % 3) * 0.18);
    ctx.lineWidth = i % 4 === 0 ? 1.4 : 0.7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMotes(time, x, y, w, h, g) {
  if (time < 0.7) return;
  const travel = h * 0.2;
  for (let i = 0; i < 26; i++) {
    const hv = hash(i, 41);
    const period = 1.5 + (hv % 120) / 90;
    const start = 0.7 + (hv % 40) / 30;
    if (time < start) continue;
    const age = (time - start) % period;
    const u = age / period;
    const alpha = Math.sin(u * Math.PI) * (time < 7 ? 0.75 : 0.28) * (0.4 + g * 0.6);
    const px = x + Math.sin(hv + u * 7.5) * (6 + u * w * 0.05);
    const py = y - u * travel - ((hv % 20) / 20) * 10;
    drawGlint(px, py, (hv % 4 === 0 ? 2.4 : 1.2) * (w / 420), alpha, "#fff", hv % 2 ? "star" : "dot");
  }
}

/* ---------- hud + loop ---------- */

function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}

function render() {
  renderRose(t);
  setText(timeEl, formatTime(t));
  setText(bloomEl, (bloom01(t) * 100).toFixed(1) + "%");
  setText(swayEl, formatSway(swayDegrees(t)));
  setText(lettersEl, formatLetters(letterCount));
  syncEditor(t);
}

function setPausedUI() {
  playBtn.textContent = paused ? "play" : "pause";
  playBtn.setAttribute("aria-label", paused ? "Play animation" : "Pause animation");
  fpsEl.textContent = paused ? "paused" : "running · 30 fps";
  fpsEl.classList.toggle("paused", paused);
}

function loop(now) {
  raf = 0;
  if (!last) last = now;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!paused) {
    t += dt;
    if (t >= DURATION) t -= DURATION;
  }
  render();
  if (!paused) raf = requestAnimationFrame(loop);
}

function ensure() {
  if (!raf && !paused) {
    last = 0;
    raf = requestAnimationFrame(loop);
  }
}

function pause() {
  paused = true;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  setPausedUI();
  render();
  liveEl.textContent = "Paused at " + t.toFixed(1) + " seconds";
}

function play() {
  if (!paused) return;
  paused = false;
  setPausedUI();
  liveEl.textContent = "Playing";
  ensure();
}

function toggle() {
  if (paused) play();
  else pause();
}

function replay() {
  t = 0;
  paused = false;
  setPausedUI();
  liveEl.textContent = "Replaying from the start";
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  ensure();
}

function seek(sec) {
  t = clamp(sec, 0, DURATION);
  render();
}

playBtn.addEventListener("click", toggle);
document.getElementById("replay").addEventListener("click", replay);

document.addEventListener("keydown", (event) => {
  if (event.target.closest("button, a, input, textarea")) return;
  if (event.code === "Space") {
    event.preventDefault();
    toggle();
  } else if (event.key === "r" || event.key === "R") {
    event.preventDefault();
    replay();
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    seek(t + 0.5);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    seek(Math.max(0, t - 0.5));
  }
});

window.addEventListener("resize", () => render());

window.__art = {
  seek,
  play,
  pause,
  replay,
  get time() { return t; },
  get letters() { return letterCount; },
  get bloom() { return bloom01(t); },
  get paused() { return paused; },
};

buildEditor();
setPausedUI();
render();
if (!paused) ensure();

if (document.fonts && document.fonts.load) {
  document.fonts.load('16px "JetBrains Mono"').then(function () {
    render();
  });
}
