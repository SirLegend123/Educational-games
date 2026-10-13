"use strict";
// Shared helpers for algebra games: polynomials with whole-number
// coefficients in one or more letters, e.g. x² + 5x + 6 or 6a − 15b.
// A polynomial is an object mapping a monomial key to its coefficient:
// { "x^2": 1, "x": 5, "1": 6 }. Keys list letters alphabetically, with
// powers above 1 written as ^n and joined by "*", e.g. "a*b", "x^2".
const Alg = (() => {
  const SUP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4" };

  function keyOf(vars) {
    const k = Object.keys(vars).filter((v) => vars[v]).sort()
      .map((v) => (vars[v] === 1 ? v : `${v}^${vars[v]}`)).join("*");
    return k || "1";
  }
  function varsOf(key) {
    const vars = {};
    if (key === "1") return vars;
    for (const part of key.split("*")) {
      const [v, p] = part.split("^");
      vars[v] = p ? +p : 1;
    }
    return vars;
  }
  const degree = (key) => Object.values(varsOf(key)).reduce((a, b) => a + b, 0);

  function clean(p) {
    const out = {};
    for (const k in p) if (p[k] !== 0) out[k] = p[k];
    return out;
  }
  // A single term, e.g. term(3, "x") is 3x.
  const term = (coef, key = "1") => clean({ [key]: coef });

  function add(p, q, sign = 1) {
    const out = { ...p };
    for (const k in q) out[k] = (out[k] || 0) + sign * q[k];
    return clean(out);
  }
  function mul(p, q) {
    let out = {};
    for (const a in p) for (const b in q) {
      const va = varsOf(a), vb = varsOf(b);
      for (const v in vb) va[v] = (va[v] || 0) + vb[v];
      out = add(out, { [keyOf(va)]: p[a] * q[b] });
    }
    return out;
  }
  function eq(p, q) {
    const a = clean(p), b = clean(q);
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => a[k] === b[k]);
  }

  // Order terms: highest power first, then alphabetically, constants last.
  const order = (keys) => keys.sort((a, b) => degree(b) - degree(a) || (a === "1") - (b === "1") || a.localeCompare(b));

  function monoText(key, html) {
    if (key === "1") return "";
    return key.split("*").map((part) => {
      const [v, p] = part.split("^");
      if (!p) return v;
      return html ? `${v}<sup>${p}</sup>` : v + ({ 2: "²", 3: "³", 4: "⁴" }[p] || "^" + p);
    }).join("");
  }
  // One term with its coefficient: 3x, −x, x², 7.
  function termText(coef, key, html = false) {
    const m = monoText(key, html);
    if (!m) return coef < 0 ? "−" + -coef : String(coef);
    const c = coef === 1 ? "" : coef === -1 ? "−" : coef < 0 ? "−" + -coef : String(coef);
    return c + m;
  }
  // A polynomial as text, e.g. "x² + 5x − 6". Pass keys to fix the order.
  function fmt(p, { html = false, keys = null } = {}) {
    const ks = keys ? keys.filter((k) => p[k]) : order(Object.keys(clean(p)));
    if (!ks.length) return "0";
    return ks.map((k, i) => {
      const t = termText(p[k], k, html);
      if (i === 0) return t;
      return p[k] < 0 ? " − " + t.slice(1) : " + " + t;
    }).join("");
  }
  // A list of terms [{ coef, key }] in the given order, e.g. a bracket's contents.
  function fmtTerms(terms, html = false) {
    return terms.map((t, i) => {
      const s = termText(t.coef, t.key, html);
      if (i === 0) return s;
      return t.coef < 0 ? " − " + s.slice(1) : " + " + s;
    }).join("");
  }
  const fromTerms = (terms) => terms.reduce((p, t) => add(p, term(t.coef, t.key)), {});

  // Read what a student typed. Returns { poly, terms, likeTerms } or { error }.
  // likeTerms is true when two typed terms could still be collected.
  function parse(input) {
    let s = input.toLowerCase().replace(/\s+/g, "")
      .replace(/[−–—]/g, "-").replace(/[×*·]/g, "")
      .replace(/[⁰¹²³⁴]/g, (c) => "^" + SUP[c]);
    if (!s) return { error: "Type your answer." };
    if (/[()]/.test(s)) return { error: "Your answer shouldn't have brackets: expand them!" };
    if (/[=]/.test(s)) return { error: "Just type the expression, without an = sign." };
    if (!/^[+-]/.test(s)) s = "+" + s;
    const parts = s.match(/[+-][^+-]*/g) || [];
    if (parts.join("") !== s) return { error: "I couldn't read that. Try something like 3x + 12" };
    const terms = [];
    for (const part of parts) {
      const sign = part[0] === "-" ? -1 : 1;
      const body = part.slice(1);
      const m = body.match(/^(\d*)((?:[a-z](?:\^\d+)?)*)$/);
      if (/[a-z]\d/.test(body)) return { error: `To write a power like x², type x^2 or x² (not "${body}").` };
      if (!body || !m || (!m[1] && !m[2])) {
        return { error: body ? `I don't understand "${body}". Use letters, numbers and ^ or ² for powers.` : "There are two signs in a row. Check your + and − signs." };
      }
      const coef = sign * (m[1] ? parseInt(m[1], 10) : 1);
      const vars = {};
      for (const [, v, p] of m[2].matchAll(/([a-z])(?:\^(\d+))?/g)) vars[v] = (vars[v] || 0) + (p ? +p : 1);
      terms.push({ coef, key: keyOf(vars) });
    }
    const keys = terms.map((t) => t.key);
    return { poly: fromTerms(terms), terms, likeTerms: new Set(keys).size !== keys.length };
  }

  return { keyOf, varsOf, term, add, mul, eq, fmt, fmtTerms, termText, fromTerms, parse, order };
})();
