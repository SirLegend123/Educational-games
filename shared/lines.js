"use strict";
// Shared helpers for the straight-line games: reading equations such as
// y = 2x + 1, writing numbers as fractions or decimals, and drawing
// coordinate grids as SVG.
const Lines = (() => {
  const EPS = 1e-9;

  // { n, d } with d <= maxDen if v is (close to) such a fraction, else null.
  function fraction(v, maxDen = 12) {
    const sign = v < 0 ? -1 : 1;
    const a = Math.abs(v);
    for (let d = 1; d <= maxDen; d++) {
      const n = Math.round(a * d);
      if (Math.abs(a * d - n) < 1e-7) return { n: sign * n, d };
    }
    return null;
  }

  // Format a number for display. style "decimal" shows short decimals as
  // decimals (4.5); otherwise simple fractions are preferred (9/2).
  function fmt(v, style = "fraction") {
    if (Math.abs(v) < EPS) return "0";
    const sign = v < 0 ? "−" : "";
    const a = Math.abs(v);
    if (style === "decimal" && Math.abs(a * 1000 - Math.round(a * 1000)) < 1e-7) {
      return sign + String(+a.toFixed(3));
    }
    const f = fraction(a);
    if (f) return sign + (f.d === 1 ? f.n : f.n + "/" + f.d);
    return sign + String(+a.toFixed(3));
  }

  // A number in brackets if negative, for substitutions like 2 × (−3).
  function fmtP(v, style) {
    return v < -EPS ? `(${fmt(v, style)})` : fmt(v, style);
  }

  // "3x + 5", "−x", "4", using v as the variable name.
  function lin(m, c, style, v = "x") {
    let s = "";
    if (Math.abs(m) > EPS) {
      if (Math.abs(m - 1) < EPS) s = v;
      else if (Math.abs(m + 1) < EPS) s = "−" + v;
      else s = fmt(m, style) + v;
    }
    if (!s) return fmt(c, style);
    if (Math.abs(c) < EPS) return s;
    return s + (c > 0 ? " + " : " − ") + fmt(Math.abs(c), style);
  }

  const formatEq = (m, c, style) => "y = " + lin(m, c, style);

  // Parse an unsigned number such as 3, 0.5, .5, 2/3 or (2/3).
  function parseNum(str) {
    if (/^\(.*\)$/.test(str)) str = str.slice(1, -1);
    const m = str.match(/^(\d+(?:\.\d+)?|\.\d+)(?:\/(\d+(?:\.\d+)?|\.\d+))?$/);
    if (!m) return NaN;
    const top = parseFloat(m[1]);
    if (m[2] === undefined) return top;
    const bottom = parseFloat(m[2]);
    return bottom === 0 ? NaN : top / bottom;
  }

  function clean(input) {
    return input.toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[−–—]/g, "-")
      .replace(/[×*·]/g, "");
  }

  // Parse a signed answer such as "-3", "7/2", "x = -1.5". NaN if unreadable.
  function parseNumber(input) {
    let s = clean(input).replace(/^[a-z]=/, "");
    let sign = 1;
    if (s[0] === "-") { sign = -1; s = s.slice(1); }
    else if (s[0] === "+") s = s.slice(1);
    const v = parseNum(s);
    return isNaN(v) ? NaN : sign * v;
  }

  // Turn text like "y = -1/2x + 3" into { m, c, style }, or { error }.
  function parseLine(input) {
    let s = clean(input);
    if (!s) return { error: "Type an equation, for example y = 2x + 1" };
    const style = s.includes("/") ? "fraction" : "decimal";

    if (s.includes("=")) {
      const parts = s.split("=");
      if (parts.length !== 2) return { error: "Use just one = sign, like y = 2x + 1" };
      if (parts[0] === "y") s = parts[1];
      else if (parts[1] === "y") s = parts[0];
      else return { error: "Write it as y = mx + c (y on its own on one side)" };
    }
    if (s.includes("y")) return { error: "Write it as y = mx + c (y on its own on one side)" };
    if (!s) return { error: "What does y equal? For example y = 2x + 1" };
    if (/x\(|\)\(/.test(s)) return { error: "Try writing it without brackets, like y = 2x + 1" };

    if (!/^[+-]/.test(s)) s = "+" + s;
    const terms = s.match(/[+-][^+-]*/g) || [];
    if (terms.join("") !== s) return { error: "I couldn't read that. Try something like y = 2x + 1" };

    let m = 0, c = 0;
    for (const t of terms) {
      const sign = t[0] === "-" ? -1 : 1;
      const body = t.slice(1);
      if (!body) return { error: "There are two signs in a row. Check your + and − signs" };
      const xi = body.indexOf("x");
      if (xi === -1) {
        const v = parseNum(body);
        if (isNaN(v)) return { error: `I don't understand "${body}"` };
        c += sign * v;
      } else {
        if (body.indexOf("x", xi + 1) !== -1) return { error: "Only use x once in each term, like 2x" };
        const before = body.slice(0, xi);
        const after = body.slice(xi + 1);
        let coef = before === "" ? 1 : parseNum(before);
        if (after !== "") {
          if (after[0] !== "/") return { error: `I don't understand "${body}"` };
          const d = parseNum(after.slice(1));
          coef = isNaN(d) ? NaN : coef / d;
        }
        if (isNaN(coef)) return { error: `I don't understand "${body}"` };
        m += sign * coef;
      }
    }
    if (Math.abs(m) > 1000 || Math.abs(c) > 1000) return { error: "Those numbers are too big for the grid" };
    return { m, c, style };
  }

  // Parse an nth term rule such as "4n + 3", "23 - 3n" or "nth term = 4n+3"
  // into { a, b, style } meaning an + b, or { error }.
  function parseNth(input) {
    let s = input.trim();
    if (!s) return { error: "Type a rule using n, for example 4n + 3" };
    if (s.includes("=")) s = s.slice(s.lastIndexOf("=") + 1);
    if (/[xy]/i.test(s)) return { error: "Use n for the position, for example 4n + 3" };
    const r = parseLine("y=" + s.replace(/n/gi, "x"));
    if (r.error) {
      return { error: r.error.replace(/y = 2x \+ 1/g, "4n + 3").replace(/x/g, "n").replace(" for the grid", "") };
    }
    return { a: r.m, b: r.c, style: r.style };
  }

  // A sentence explaining what m and c mean for this line.
  function explain(m, c, style) {
    let g;
    if (Math.abs(m) < EPS) {
      g = "Gradient 0: the line is horizontal (flat).";
    } else {
      const dir = m > 0 ? "up" : "down";
      const f = style === "decimal" ? null : fraction(Math.abs(m));
      if (f && f.d > 1) g = `Gradient ${fmt(m, style)}: for every ${f.d} steps right, the line goes ${dir} ${f.n}.`;
      else g = `Gradient ${fmt(m, style)}: for every 1 step right, the line goes ${dir} ${fmt(Math.abs(m), style)}.`;
    }
    return `${g} y-intercept ${fmt(c, style)}: it crosses the y-axis at (0, ${fmt(c, style)}).`;
  }

  // The part of y = mx + c inside the square -N..N as [x1, y1, x2, y2], or null.
  function clipLine(m, c, N) {
    let lo, hi;
    if (Math.abs(m) < EPS) {
      if (Math.abs(c) > N + EPS) return null;
      lo = -N; hi = N;
    } else {
      const a = (-N - c) / m, b = (N - c) / m;
      lo = Math.max(-N, Math.min(a, b));
      hi = Math.min(N, Math.max(a, b));
      if (lo > hi + EPS) return null;
    }
    return [lo, m * lo + c, hi, m * hi + c];
  }

  const SVGNS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // Clear svg and draw an empty grid from -N to N. Returns drawing helpers.
  function createGrid(svg, N) {
    const CELL = 30, PAD = 34;
    const sx = (x) => PAD + (x + N) * CELL;
    const sy = (y) => PAD + (N - y) * CELL;
    svg.innerHTML = "";
    const size = 2 * N * CELL + 2 * PAD;
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    const span = 2 * N * CELL;

    el("rect", { x: sx(-N), y: sy(N), width: span, height: span, class: "sea", rx: 4 }, svg);
    for (let i = -N; i <= N; i++) {
      el("line", { x1: sx(i), y1: sy(-N), x2: sx(i), y2: sy(N), class: "gl" }, svg);
      el("line", { x1: sx(-N), y1: sy(i), x2: sx(N), y2: sy(i), class: "gl" }, svg);
    }
    el("line", { x1: sx(-N), y1: sy(0), x2: sx(N), y2: sy(0), class: "axis" }, svg);
    el("line", { x1: sx(0), y1: sy(-N), x2: sx(0), y2: sy(N), class: "axis" }, svg);

    const step = N > 6 ? 2 : 1;
    for (let i = -N; i <= N; i += step) {
      const label = i < 0 ? "−" + -i : String(i);
      el("text", { x: sx(i), y: sy(-N) + 22, class: "tick", "text-anchor": "middle" }, svg).textContent = label;
      el("text", { x: sx(-N) - 8, y: sy(i) + 5, class: "tick", "text-anchor": "end" }, svg).textContent = label;
    }
    el("text", { x: sx(N) + 8, y: sy(0) + 5, class: "axis-name" }, svg).textContent = "x";
    el("text", { x: sx(0), y: sy(N) - 10, class: "axis-name", "text-anchor": "middle" }, svg).textContent = "y";

    return {
      N, CELL, sx, sy, svg,
      el: (tag, attrs, parent = svg) => el(tag, attrs, parent),
      // Draw y = mx + c clipped to the grid. Returns the element, or null.
      line(m, c, cls, extra = {}) {
        const seg = clipLine(m, c, N);
        if (!seg) return null;
        return el("line", { x1: sx(seg[0]), y1: sy(seg[1]), x2: sx(seg[2]), y2: sy(seg[3]), class: cls, pathLength: 1, ...extra }, svg);
      },
      point(x, y, cls, r = 6) {
        return el("circle", { cx: sx(x), cy: sy(y), r, class: cls }, svg);
      },
      text(x, y, str, cls, extra = {}) {
        const t = el("text", { x: sx(x), y: sy(y), class: cls, ...extra }, svg);
        t.textContent = str;
        return t;
      },
      // Convert a pointer event to grid coordinates.
      toGrid(evt) {
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX; pt.y = evt.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        return { x: (p.x - PAD) / CELL - N, y: N - (p.y - PAD) / CELL };
      },
    };
  }

  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) { const j = randInt(0, i); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  return { EPS, fraction, fmt, fmtP, lin, formatEq, parseNumber, parseLine, parseNth, explain, clipLine, createGrid, randInt, pick, shuffle };
})();
