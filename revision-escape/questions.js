"use strict";
// Question bank for the Revision Escape Room: three question makers per
// topic per level. Each maker returns a fresh random question:
//   { type, html, ans, hint, explain, ...extras }
// type: "num" (a number), "frac" (a fraction or mixed number), "expr" (an
// algebraic expression), "line" (y = mx + c), "rule" (an nth term),
// "sf" (standard form), or "mc" (multiple choice: options + correct index).
const Bank = (() => {
  const R = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  const neg = (v) => (v < 0 ? "−" + -v : String(v));
  const P = (v) => (v < 0 ? `(${neg(v)})` : neg(v));
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = (n) => String(n).split("").map((c) => SUP[c]).join("");

  /* ---------- Fractions { n, d } ---------- */
  const F = (n, d = 1) => { const g = gcd(n, d) || 1; const s = d < 0 ? -1 : 1; return { n: s * n / g, d: s * d / g }; };
  const fadd = (x, y) => F(x.n * y.d + y.n * x.d, x.d * y.d);
  const fsub = (x, y) => F(x.n * y.d - y.n * x.d, x.d * y.d);
  const fmul = (x, y) => F(x.n * y.n, x.d * y.d);
  const fdiv = (x, y) => F(x.n * y.d, x.d * y.n);
  const fracHtml = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
  function fHtml(f) {
    if (f.d === 1) return neg(f.n);
    const sign = f.n < 0 ? "−" : "", a = Math.abs(f.n);
    if (a < f.d) return sign + fracHtml(a, f.d);
    return `${sign}<span class="mixed">${Math.floor(a / f.d)}${fracHtml(a % f.d, f.d)}</span>`;
  }
  const mixedHtml = (w, n, d) => `<span class="mixed">${w}${fracHtml(n, d)}</span>`;
  function randMixed() {
    const d = pick([2, 3, 4, 5, 6, 8]);
    let n; do n = R(1, d - 1); while (gcd(n, d) !== 1);
    return { w: R(1, 3), n, d };
  }
  const properOf = (d) => { let n; do n = R(1, d - 1); while (gcd(n, d) !== 1); return n; };
  const mixedVal = (m) => F(m.w * m.d + m.n, m.d);

  /* ---------- Exact decimals for standard form: M × 10^E ---------- */
  const V = (M, E) => { if (M === 0) return { M: 0, E: 0 }; while (M % 10 === 0) { M /= 10; E++; } return { M, E }; };
  function dec(v) {
    const s = String(Math.abs(v.M)), sign = v.M < 0 ? "−" : "";
    if (v.E >= 0) return sign + s + "0".repeat(v.E);
    const k = -v.E;
    return sign + (k >= s.length ? "0." + "0".repeat(k - s.length) + s : s.slice(0, s.length - k) + "." + s.slice(s.length - k));
  }
  const group = (str) => { const [i, f] = str.split("."); const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, " "); return f ? g + "." + f : g; };
  function toSF(v) { const s = String(Math.abs(v.M)); return { a: s.length > 1 ? s[0] + "." + s.slice(1) : s, n: v.E + s.length - 1 }; }
  const sfHtml = (v) => { const t = toSF(v); return `${t.a} × 10<sup>${neg(t.n)}</sup>`; };
  const front = (dp) => (dp ? V(R(11, 99), -1) : V(R(2, 9), 0));
  const vmul = (x, y) => V(x.M * y.M, x.E + y.E);

  /* ---------- Shared text helpers ---------- */
  const lineText = (m, c) => Lines.formatEq(m, c);
  const ruleText = (a, b) => Lines.lin(a, b, "decimal", "n");
  const steps = (...lines) => `<ol class="steps">${lines.map((l) => `<li>${l}</li>`).join("")}</ol>`;
  const mc = (html, right, wrongs, hint, explain) => {
    const options = shuffle([right, ...wrongs]);
    return { type: "mc", html, options, correct: options.indexOf(right), hint, explain };
  };
  const divisors = (n) => { const out = []; for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i); return out; };
  // Prime factors as [[prime, power], ...], and written in index form.
  function factorList(n) {
    const out = [];
    for (let p = 2; n > 1; p++) { let k = 0; while (n % p === 0) { n /= p; k++; } if (k) out.push([p, k]); }
    return out;
  }
  const listText = (list) => list.map(([p, k]) => (k > 1 ? p + sup(k) : String(p))).join(" × ");
  const indexForm = (n) => listText(factorList(n));
  // Three plausible wrong answers for "n as a product of primes".
  function factorDistractors(n) {
    const list = factorList(n), right = listText(list);
    const out = new Set();
    out.add(listText(list.map(([p]) => [p, 1])));                         // forgot the powers
    out.add(listText(list.map(([p, k], i) => [p, i === 0 ? k + 1 : k])));  // a power too many
    const c = [4, 6, 9, 10, 12].find((c) => n % c === 0 && n / c > 1);      // a non-prime factor
    if (c) out.add(`${c} × ${n / c}`);
    if (list.length > 1 && list[0][1] !== list[1][1]) out.add(listText([[list[0][0], list[1][1]], [list[1][0], list[0][1]], ...list.slice(2)]));
    out.delete(right);
    return [...out].slice(0, 3);
  }

  /* ================= Topics ================= */

  const arithmetic = {
    easy: [
      () => { const a = R(23, 89), b = R(11, 59), c = R(5, 30); return { type: "num", html: `${a} + ${b} − ${c}`, ans: a + b - c, hint: "Work from left to right: add first, then subtract.", explain: steps(`${a} + ${b} = ${a + b}`, `${a + b} − ${c} = ${a + b - c}`) }; },
      () => { const a = R(3, 12), b = R(3, 12); return { type: "num", html: `${a} × ${b}`, ans: a * b, hint: `Use your ${a} times table.`, explain: steps(`${a} × ${b} = ${a * b}`) }; },
      () => { const b = R(2, 9), q = R(3, 12); return { type: "num", html: `${b * q} ÷ ${b}`, ans: q, hint: `How many ${b}s make ${b * q}?`, explain: steps(`${b} × ${q} = ${b * q}, so ${b * q} ÷ ${b} = ${q}`) }; },
    ],
    medium: [
      () => { const a = R(2, 20), b = R(2, 9), c = R(2, 9); return { type: "num", html: `${a} + ${b} × ${c}`, ans: a + b * c, hint: "BIDMAS: multiply before you add.", explain: steps(`${b} × ${c} = ${b * c}`, `${a} + ${b * c} = ${a + b * c}`) }; },
      () => { const a = -R(2, 12), b = R(2, 12); return { type: "num", html: `${neg(a)} − ${b}`, ans: a - b, hint: "Start at the negative number and count down further.", explain: steps(`${neg(a)} − ${b} = ${neg(a - b)}`) }; },
      () => { const a = R(2, 9), b = R(2, 9), c = R(2, 6); return { type: "num", html: `(${a} + ${b}) × ${c}`, ans: (a + b) * c, hint: "Brackets first!", explain: steps(`${a} + ${b} = ${a + b}`, `${a + b} × ${c} = ${(a + b) * c}`) }; },
    ],
    hard: [
      () => { const a = R(1, 5), b = R(1, 5), c = R(2, 9), d = R(2, 6); const s = (a + b) ** 2; return { type: "num", html: `(${a} + ${b})² − ${c} × ${d}`, ans: s - c * d, hint: "BIDMAS: brackets, then the power, then multiply, then subtract.", explain: steps(`(${a} + ${b})² = ${a + b}² = ${s}`, `${c} × ${d} = ${c * d}`, `${s} − ${c * d} = ${neg(s - c * d)}`) }; },
      () => { const a = R(21, 79), b = R(12, 49); return { type: "num", html: `${a} × ${b}`, ans: a * b, hint: `Split it up: ${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10}.`, explain: steps(`${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}`, `${a} × ${b % 10} = ${a * (b % 10)}`, `${a * Math.floor(b / 10) * 10} + ${a * (b % 10)} = ${a * b}`) }; },
      () => { const c = R(2, 6), k = R(2, 6), b = R(2, 9), a = c * k; return { type: "num", html: `(−${a}) × (−${b}) ÷ ${c}`, ans: k * b, hint: "A negative times a negative is positive. Then divide.", explain: steps(`(−${a}) × (−${b}) = ${a * b}`, `${a * b} ÷ ${c} = ${k * b}`) }; },
    ],
  };

  const PRIMES = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  const COMPOSITES = [9, 15, 21, 25, 27, 33, 35, 39, 49, 51, 57, 63];
  const primes = {
    easy: [
      () => { const p = pick(PRIMES), w = shuffle([...COMPOSITES]).slice(0, 3); return mc("Which of these is a <strong>prime number</strong>?", String(p), w.map(String), "A prime has exactly two factors: 1 and itself. Try dividing each by 3, 5 and 7.", steps(`${p} only divides by 1 and ${p}.`, ...w.map((n) => `${n} = ${divisors(n)[1]} × ${n / divisors(n)[1]}`))); },
      () => { const n = pick([6, 8, 10, 12, 15, 16, 18, 20, 24]); const ds = divisors(n); return { type: "num", html: `How many factors does <strong>${n}</strong> have?`, ans: ds.length, hint: "List them in pairs that multiply to make the number, starting with 1.", explain: steps(`The factors of ${n} are ${ds.join(", ")}`, `That's ${ds.length} factors.`) }; },
      () => { const n = pick([12, 18, 20, 24, 30, 36, 42, 45]); return { type: "num", html: `Write down a factor of <strong>${n}</strong> that is between 2 and ${n / 2}.`, check: (v) => v >= 2 && v <= n / 2 && n % v === 0, ans: divisors(n)[1], hint: `A factor divides into ${n} exactly, with no remainder.`, explain: steps(`Any of these work: ${divisors(n).filter((d) => d >= 2 && d <= n / 2).join(", ")}`) }; },
    ],
    medium: [
      () => { const h = R(2, 9); let m, n; do { m = R(2, 7); n = R(2, 7); } while (m === n || gcd(m, n) !== 1); return { type: "num", html: `What is the <strong>HCF</strong> (highest common factor) of ${h * m} and ${h * n}?`, ans: h, hint: "List the factors of each number and find the biggest one they share.", explain: steps(`${h * m} = ${h} × ${m}`, `${h * n} = ${h} × ${n}`, `${m} and ${n} share no factors, so the HCF is ${h}.`) }; },
      () => { let a, b; do { a = R(3, 12); b = R(3, 12); } while (a === b || lcm(a, b) > 100 || a % b === 0 || b % a === 0); return { type: "num", html: `What is the <strong>LCM</strong> (lowest common multiple) of ${a} and ${b}?`, ans: lcm(a, b), hint: `List the multiples of ${Math.max(a, b)} until you reach one that ${Math.min(a, b)} also goes into.`, explain: steps(`Multiples of ${a}: ${[1, 2, 3, 4, 5, 6].map((k) => a * k).join(", ")}…`, `The first one that is also a multiple of ${b} is ${lcm(a, b)}.`) }; },
      () => { const n = pick([24, 36, 40, 45, 48, 54, 60, 72, 84, 90]); return mc(`Which is <strong>${n}</strong> written as a product of prime factors?`, indexForm(n), factorDistractors(n), "Every number in the answer must be prime. Use a factor tree, and check by multiplying back.", steps(`${n} = ${indexForm(n)}`, `Every number used is prime, and they multiply back to ${n}.`)); },
    ],
    hard: [
      () => { const h = R(4, 15); let m, n; do { m = R(2, 9); n = R(2, 9); } while (m === n || gcd(m, n) !== 1); return { type: "num", html: `Find the <strong>HCF</strong> of ${h * m} and ${h * n}.`, ans: h, hint: "Write both as products of prime factors and multiply the primes they share.", explain: steps(`${h * m} = ${indexForm(h * m)}`, `${h * n} = ${indexForm(h * n)}`, `The shared part is ${indexForm(h)} = ${h}.`) }; },
      () => { let a, b; do { a = R(8, 40); b = R(8, 40); } while (a === b || lcm(a, b) > 400 || gcd(a, b) === 1 || a % b === 0 || b % a === 0); return { type: "num", html: `Find the <strong>LCM</strong> of ${a} and ${b}.`, ans: lcm(a, b), hint: "LCM = (first number × second number) ÷ HCF.", explain: steps(`HCF of ${a} and ${b} is ${gcd(a, b)}`, `${a} × ${b} ÷ ${gcd(a, b)} = ${lcm(a, b)}`) }; },
      () => { const n = pick([120, 168, 180, 200, 252, 280, 300, 360, 392, 450, 504]); return mc(`Which is <strong>${n}</strong> as a product of prime factors in index form?`, indexForm(n), factorDistractors(n), "Divide by the smallest prime again and again, then count how many of each prime you used.", steps(`${n} = ${indexForm(n)}`)); },
    ],
  };

  const fractions = {
    easy: [
      () => { const q = R(3, 12); let p; do p = R(1, q - 1); while (gcd(p, q) !== 1); const k = R(2, 5); return { type: "frac", simplest: true, html: `Simplify ${fracHtml(p * k, q * k)} fully.`, ans: F(p, q), hint: `Divide the top and bottom by the same number. Both divide by ${k}.`, explain: steps(`${p * k} ÷ ${k} = ${p}, ${q * k} ÷ ${k} = ${q}`, `So the answer is ${fracHtml(p, q)}.`) }; },
      () => { const q = R(2, 8), N = q * R(2, 12); return { type: "num", html: `What is ${fracHtml(1, q)} of ${N}?`, ans: N / q, hint: `Divide ${N} by ${q}.`, explain: steps(`${N} ÷ ${q} = ${N / q}`) }; },
      () => { const d = pick([5, 7, 8, 9, 11]); const a = R(1, d - 2), b = R(1, d - 1 - a); return { type: "frac", html: `${fracHtml(a, d)} + ${fracHtml(b, d)}`, ans: F(a + b, d), hint: "The denominators are the same, so just add the numerators.", explain: steps(`${a} + ${b} = ${a + b}`, `${fracHtml(a + b, d)}${gcd(a + b, d) > 1 ? ` = ${fHtml(F(a + b, d))}` : ""}`) }; },
    ],
    medium: [
      () => { let b, d; do { b = R(2, 8); d = R(2, 8); } while (b === d); const a = properOf(b), c = properOf(d); const L = lcm(b, d); const ans = fadd(F(a, b), F(c, d)); return { type: "frac", html: `${fracHtml(a, b)} + ${fracHtml(c, d)}`, ans, hint: `Make the denominators the same first. Try ${L}.`, explain: steps(`${fracHtml(a * L / b, L)} + ${fracHtml(c * L / d, L)} = ${fracHtml(a * L / b + c * L / d, L)}`, `= ${fHtml(ans)}`) }; },
      () => { const b = R(2, 9), d = R(2, 9), a = properOf(b), c = properOf(d); const ans = fmul(F(a, b), F(c, d)); return { type: "frac", html: `${fracHtml(a, b)} × ${fracHtml(c, d)}`, ans, hint: "Multiply the numerators, multiply the denominators, then simplify.", explain: steps(`${a} × ${c} = ${a * c}, ${b} × ${d} = ${b * d}`, `${fracHtml(a * c, b * d)} = ${fHtml(ans)}`) }; },
      () => { const q = R(3, 9); let p; do p = R(2, q - 1); while (gcd(p, q) !== 1); const k = R(2, 10); return { type: "num", html: `What is ${fracHtml(p, q)} of ${q * k}?`, ans: p * k, hint: `Find ${fracHtml(1, q)} first (divide by ${q}), then multiply by ${p}.`, explain: steps(`${q * k} ÷ ${q} = ${k}`, `${k} × ${p} = ${p * k}`) }; },
    ],
    hard: [
      () => { const x = randMixed(), y = randMixed(); const ans = fmul(mixedVal(x), mixedVal(y)); return { type: "frac", html: `${mixedHtml(x.w, x.n, x.d)} × ${mixedHtml(y.w, y.n, y.d)}`, ans, hint: "Change both to improper fractions first, then multiply tops and bottoms.", explain: steps(`${fracHtml(mixedVal(x).n, mixedVal(x).d)} × ${fracHtml(mixedVal(y).n, mixedVal(y).d)} = ${fracHtml(mixedVal(x).n * mixedVal(y).n, mixedVal(x).d * mixedVal(y).d)}`, `= ${fHtml(ans)}`) }; },
      () => { let x, y, ans; do { x = randMixed(); y = randMixed(); x.w = y.w + R(1, 2); ans = fsub(mixedVal(x), mixedVal(y)); } while (x.n * y.d >= y.n * x.d); return { type: "frac", html: `${mixedHtml(x.w, x.n, x.d)} − ${mixedHtml(y.w, y.n, y.d)}`, ans, hint: "The first fraction part is smaller, so change both to improper fractions (or borrow a whole).", explain: steps(`${fracHtml(mixedVal(x).n, mixedVal(x).d)} − ${fracHtml(mixedVal(y).n, mixedVal(y).d)}`, `Common denominator ${lcm(x.d, y.d)}: = ${fHtml(ans)}`) }; },
      () => { const x = randMixed(); const d = pick([2, 3, 4, 5]); let n; do n = R(1, d - 1); while (gcd(n, d) !== 1); const ans = fdiv(mixedVal(x), F(n, d)); return { type: "frac", html: `${mixedHtml(x.w, x.n, x.d)} ÷ ${fracHtml(n, d)}`, ans, hint: "Improper fraction first. Then Keep, Change, Flip: × the upside-down second fraction.", explain: steps(`${fracHtml(mixedVal(x).n, mixedVal(x).d)} × ${fracHtml(d, n)} = ${fracHtml(mixedVal(x).n * d, mixedVal(x).d * n)}`, `= ${fHtml(ans)}`) }; },
    ],
  };

  const standardForm = {
    easy: [
      () => { const v = vmul(front(pick([0, 1])), V(1, R(3, 6))); return { type: "sf", html: `Write <strong>${group(dec(v))}</strong> in standard form.`, ans: v, hint: "Put the decimal point after the first digit, then count how many places it moved.", explain: steps(`${group(dec(v))} = ${sfHtml(v)}`) }; },
      () => { const v = vmul(front(pick([0, 1])), V(1, R(2, 5))); return { type: "num", html: `Write ${sfHtml(v)} as an ordinary number.`, ans: Number(dec(v)), hint: `Move the decimal point ${toSF(v).n} places to the right.`, explain: steps(`${sfHtml(v)} = ${group(dec(v))}`) }; },
      () => { const a = R(11, 99) / 10, n = R(3, 6); const A = String(a); return mc("Which number is written in <strong>standard form</strong>?", `${A} × 10${sup(n)}`, [`${Math.round(a * 10)} × 10${sup(n - 1)}`, `0.${A.replace(".", "")} × 10${sup(n + 1)}`, `${A} + 10${sup(n)}`], "The first number must be at least 1 and less than 10, and it must be × a power of 10.", steps(`${A} is between 1 and 10, and it's multiplied by 10${sup(n)}.`)); },
    ],
    medium: [
      () => { const v = vmul(front(pick([0, 1])), V(1, -R(3, 6))); return { type: "sf", html: `Write <strong>${dec(v)}</strong> in standard form.`, ans: v, hint: "For numbers less than 1, the power of 10 is negative.", explain: steps(`${dec(v)} = ${sfHtml(v)}`) }; },
      () => { const vals = []; while (vals.length < 4) { const v = vmul(front(1), V(1, R(-3, 7))); if (!vals.some((u) => toSF(u).n === toSF(v).n)) vals.push(v); } const best = vals.reduce((a, b) => (toSF(b).n > toSF(a).n ? b : a)); return mc("Which number is the <strong>largest</strong>?", sfHtml(best), vals.filter((v) => v !== best).map(sfHtml), "Compare the powers of 10 first.", steps(`${sfHtml(best)} has the biggest power of 10.`)); },
      () => { let x, y; do { x = front(pick([0, 1])); y = front(0); } while (x.M * y.M * 10 ** (x.E + y.E) >= 10); const n1 = R(2, 6), n2 = R(2, 6); const ans = vmul(V(x.M, x.E + n1), V(y.M, y.E + n2)); return { type: "sf", html: `(${sfHtml(V(x.M, x.E + n1))}) × (${sfHtml(V(y.M, y.E + n2))})`, ans, hint: "Multiply the front numbers and add the powers.", explain: steps(`${dec(x)} × ${dec(y)} = ${dec(vmul(x, y))}`, `${n1} + ${n2} = ${n1 + n2}`, `= ${sfHtml(ans)}`) }; },
    ],
    hard: [
      () => { let x, y; do { x = front(pick([0, 1])); y = front(0); } while (x.M * y.M * 10 ** (x.E + y.E) < 10); const n1 = R(-5, 7), n2 = R(-6, 6); const ans = vmul(V(x.M, x.E + n1), V(y.M, y.E + n2)); return { type: "sf", html: `(${sfHtml(V(x.M, x.E + n1))}) × (${sfHtml(V(y.M, y.E + n2))})`, ans, hint: "Multiply the fronts, add the powers, then adjust so the front number is between 1 and 10.", explain: steps(`${dec(x)} × ${dec(y)} = ${dec(vmul(x, y))}`, `${neg(n1)} + ${P(n2)} = ${neg(n1 + n2)}`, `${dec(vmul(x, y))} × 10${sup(n1 + n2)} = ${sfHtml(ans)}`) }; },
      () => { const y = front(0), q = V(R(1, 9), -1), x = vmul(q, y); const n1 = R(-3, 9), n2 = R(-5, 5); const ans = V(q.M, q.E + n1 - n2); return { type: "sf", html: `(${sfHtml(V(x.M, x.E + n1))}) ÷ (${sfHtml(V(y.M, y.E + n2))})`, ans, hint: "Divide the fronts and subtract the powers. If the front is less than 1, adjust it.", explain: steps(`${dec(x)} ÷ ${dec(y)} = ${dec(q)}`, `${neg(n1)} − ${P(n2)} = ${neg(n1 - n2)}`, `${dec(q)} × 10${sup(n1 - n2)} = ${sfHtml(ans)}`) }; },
      () => { const x = front(1), y = front(pick([0, 1])), n = R(3, 7); const X = V(x.M, x.E + n), Y = V(y.M, y.E + n - 1); const E = Math.min(X.E, Y.E); const ans = V(X.M * 10 ** (X.E - E) + Y.M * 10 ** (Y.E - E), E); return { type: "sf", html: `(${sfHtml(X)}) + (${sfHtml(Y)})`, ans, hint: "The powers are different. Change both to ordinary numbers (or make the powers match) before adding.", explain: steps(`${group(dec(X))} + ${group(dec(Y))} = ${group(dec(ans))}`, `= ${sfHtml(ans)}`) }; },
    ],
  };

  // Expressions: answers are polynomials (Alg).
  const T = (c, k = "1") => Alg.term(c, k);
  const B = (terms) => Alg.fmtTerms(terms.map(([coef, key]) => ({ coef, key })), true);
  const expressions = {
    easy: [
      () => { const v = pick(["a", "b", "m", "p"]); const p = R(3, 9), q = R(2, 9), r = R(1, p + q - 1); return { type: "expr", letters: [v], html: `Simplify: ${p}${v} + ${q}${v} − ${r}${v}`, ans: T(p + q - r, v), hint: `They're all ${v} terms, so add and subtract the numbers in front.`, explain: steps(`${p} + ${q} − ${r} = ${p + q - r}`, `So it's ${Alg.fmt(T(p + q - r, v))}`) }; },
      () => { const k = R(2, 9), c = R(1, 9); const ans = Alg.mul(T(k), Alg.add(T(1, "x"), T(c))); return { type: "expr", letters: ["x"], html: `Expand: ${k}(x + ${c})`, ans, hint: `Multiply both terms inside the bracket by ${k}.`, explain: steps(`${k} × x = ${k}x`, `${k} × ${c} = ${k * c}`, `= ${Alg.fmt(ans, { html: true })}`) }; },
      () => { const a1 = R(2, 6), b1 = R(2, 6), a2 = R(1, 5), b2 = R(1, b1 - 1); const ans = Alg.add(T(a1 + a2, "a"), T(b1 - b2, "b")); return { type: "expr", letters: ["a", "b"], html: `Simplify: ${a1}a + ${b1}b + ${a2 === 1 ? "" : a2}a − ${b2 === 1 ? "" : b2}b`, ans, hint: "Collect the a terms together and the b terms together.", explain: steps(`a terms: ${a1} + ${a2} = ${a1 + a2}`, `b terms: ${b1} − ${b2} = ${b1 - b2}`, `= ${Alg.fmt(ans)}`) }; },
    ],
    medium: [
      () => { const k = R(2, 7), a = R(2, 5), c = R(1, 9); const ans = Alg.mul(T(-k), Alg.add(T(a, "x"), T(-c))); return { type: "expr", letters: ["x"], html: `Expand: −${k}(${a}x − ${c})`, ans, hint: "Multiply both terms by −" + k + ". A negative times a negative is positive!", explain: steps(`−${k} × ${a}x = −${k * a}x`, `−${k} × (−${c}) = +${k * c}`, `= ${Alg.fmt(ans)}`) }; },
      () => { const a = R(1, 9), b = R(1, 9); const ans = Alg.mul(Alg.add(T(1, "x"), T(a)), Alg.add(T(1, "x"), T(b))); return { type: "expr", letters: ["x"], html: `Expand and simplify: (x + ${a})(x + ${b})`, ans, hint: "Multiply each term in the first bracket by each term in the second (a grid helps), then collect the x terms.", explain: steps(`x², ${b}x, ${a}x, ${a * b}`, `= ${Alg.fmt(ans, { html: true })}`) }; },
      () => { const k = R(1, 3), c = R(1, 9) * pick([1, -1]); const ans = Alg.mul(T(k, "x"), Alg.add(T(1, "x"), T(c))); return { type: "expr", letters: ["x"], html: `Expand: ${k === 1 ? "" : k}x(x ${c < 0 ? "−" : "+"} ${Math.abs(c)})`, ans, hint: "x × x = x². Multiply both terms inside.", explain: steps(`= ${Alg.fmt(ans, { html: true })}`) }; },
    ],
    hard: [
      () => { const a = R(2, 4), b = R(1, 7), c = R(1, 3), d = R(1, 7); const ans = Alg.mul(Alg.add(T(a, "x"), T(b)), Alg.add(T(c, "x"), T(-d))); return { type: "expr", letters: ["x"], html: `Expand and simplify: (${a}x + ${b})(${c === 1 ? "" : c}x − ${d})`, ans, hint: "Four multiplications, then collect the two x terms. Watch the signs.", explain: steps(`${a * c}x², ${-a * d}x, ${b * c}x, ${-b * d}`.replace(/-/g, "−"), `= ${Alg.fmt(ans, { html: true })}`) }; },
      () => { const a = R(2, 6), b = R(1, 7), c = R(2, 5), d = R(1, 7); const ans = Alg.add(Alg.mul(T(a), Alg.add(T(1, "x"), T(b))), Alg.mul(T(-c), Alg.add(T(1, "x"), T(-d)))); return { type: "expr", letters: ["x"], html: `Expand and simplify: ${a}(x + ${b}) − ${c}(x − ${d})`, ans, hint: `The −${c} multiplies both terms in the second bracket: −${c} × (−${d}) is positive.`, explain: steps(`${a}x + ${a * b} − ${c}x + ${c * d}`, `= ${Alg.fmt(ans)}`) }; },
      () => { const a = R(2, 9); const ans = Alg.mul(Alg.add(T(1, "x"), T(-a)), Alg.add(T(1, "x"), T(-a))); return { type: "expr", letters: ["x"], html: `Expand and simplify: (x − ${a})²`, ans, hint: `(x − ${a})² means (x − ${a})(x − ${a}). It isn't just x² − ${a * a}!`, explain: steps(`x² − ${a}x − ${a}x + ${a * a}`, `= ${Alg.fmt(ans, { html: true })}`) }; },
    ],
  };

  const equations = {
    easy: [
      () => { const x = R(2, 20), a = R(2, 15); return { type: "num", html: `Solve: x + ${a} = ${x + a}`, prefix: "x =", ans: x, hint: `Subtract ${a} from both sides.`, explain: steps(`x = ${x + a} − ${a} = ${x}`) }; },
      () => { const x = R(2, 12), a = R(2, 9); return { type: "num", html: `Solve: ${a}x = ${a * x}`, prefix: "x =", ans: x, hint: `Divide both sides by ${a}.`, explain: steps(`x = ${a * x} ÷ ${a} = ${x}`) }; },
      () => { const a = R(2, 6), b = R(2, 9); return { type: "num", html: `Solve: x ÷ ${a} = ${b}`, prefix: "x =", ans: a * b, hint: `Multiply both sides by ${a}.`, explain: steps(`x = ${b} × ${a} = ${a * b}`) }; },
    ],
    medium: [
      () => { const x = R(2, 12), a = R(2, 9), b = R(1, 15); return { type: "num", html: `Solve: ${a}x − ${b} = ${a * x - b}`, prefix: "x =", ans: x, hint: `Add ${b} to both sides, then divide by ${a}.`, explain: steps(`${a}x = ${a * x - b} + ${b} = ${a * x}`, `x = ${a * x} ÷ ${a} = ${x}`) }; },
      () => { const x = R(1, 10), a = R(2, 6), b = R(1, 8); return { type: "num", html: `Solve: ${a}(x + ${b}) = ${a * (x + b)}`, prefix: "x =", ans: x, hint: `Divide both sides by ${a} first (or expand the bracket).`, explain: steps(`x + ${b} = ${a * (x + b)} ÷ ${a} = ${x + b}`, `x = ${x + b} − ${b} = ${x}`) }; },
      () => { const x = -R(1, 9), a = R(2, 6), b = R(1, 20); return { type: "num", html: `Solve: ${a}x + ${b} = ${neg(a * x + b)}`, prefix: "x =", ans: x, hint: `Subtract ${b} from both sides, then divide by ${a}. The answer is negative.`, explain: steps(`${a}x = ${neg(a * x + b)} − ${b} = ${neg(a * x)}`, `x = ${neg(a * x)} ÷ ${a} = ${neg(x)}`) }; },
    ],
    hard: [
      () => { const x = R(-6, 12) || 3, a = R(4, 9), c = R(1, a - 1), b = R(-10, 10) || 4, d = a * x + b - c * x; return { type: "num", html: `Solve: ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${c === 1 ? "" : c}x ${d < 0 ? "−" : "+"} ${Math.abs(d)}`, prefix: "x =", ans: x, hint: `Get the x terms on one side: subtract ${c === 1 ? "" : c}x from both sides first.`, explain: steps(`${a - c === 1 ? "" : a - c}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${neg(d)}`, `${a - c === 1 ? "" : a - c}x = ${neg(d - b)}`, `x = ${neg(x)}`) }; },
      () => { const b = R(2, 5), c = R(-3, 8), x = R(-5, 12), a = b * c - x; if (a === 0) return equations.hard[1](); return { type: "num", html: `Solve: <span class="frac"><span>x ${a < 0 ? "−" : "+"} ${Math.abs(a)}</span><span>${b}</span></span> = ${neg(c)}`, prefix: "x =", ans: x, hint: `Multiply both sides by ${b} first.`, explain: steps(`x ${a < 0 ? "−" : "+"} ${Math.abs(a)} = ${neg(b * c)}`, `x = ${neg(x)}`) }; },
      () => { const x = R(1, 9), y = R(1, 9), a = R(1, 4), b = R(1, 4), d = R(1, 4); const c = a * x + b * y, e = d * x - b * y; return { type: "num", html: `Solve the simultaneous equations to find <strong>x</strong>:<br>${a === 1 ? "" : a}x + ${b === 1 ? "" : b}y = ${c}<br>${d === 1 ? "" : d}x − ${b === 1 ? "" : b}y = ${neg(e)}`, prefix: "x =", ans: x, hint: "The y terms have opposite signs, so add the two equations to eliminate y.", explain: steps(`Adding: ${a + d}x = ${c + e}`, `x = ${c + e} ÷ ${a + d} = ${x}`) }; },
    ],
  };

  const sequences = {
    easy: [
      () => { const a = R(1, 12), d = R(2, 9); const t = [0, 1, 2, 3].map((k) => a + k * d); return { type: "num", html: `What is the next term? <strong>${t.join(", ")}, …</strong>`, ans: a + 4 * d, hint: "Find the difference between the terms.", explain: steps(`The terms go up by ${d} each time.`, `${t[3]} + ${d} = ${a + 4 * d}`) }; },
      () => { const a = R(1, 10), d = R(2, 9); const t = [0, 1, 2, 3].map((k) => a + k * d); return mc(`What is the term-to-term rule for <strong>${t.join(", ")}, …</strong>?`, `Add ${d}`, [`Multiply by ${d}`, `Add ${d + 1}`, `Subtract ${d}`], "What do you do to each term to get the next one?", steps(`Each term is ${d} more than the one before.`)); },
      () => { const d = R(2, 9); const t = [1, 2, 3, 4].map((k) => k * d); return { type: "num", html: `What is the 10th term of <strong>${t.join(", ")}, …</strong>?`, ans: 10 * d, hint: `These are the ${d} times table.`, explain: steps(`The nth term is ${d}n.`, `${d} × 10 = ${10 * d}`) }; },
    ],
    medium: [
      () => { const a = R(2, 9), b = R(-5, 9); const t = [1, 2, 3, 4].map((n) => a * n + b); return { type: "rule", html: `Find the nth term of <strong>${t.map(neg).join(", ")}, …</strong>`, ans: { a, b }, hint: `The difference is ${a}, so start with ${a}n. Then compare with ${a}, ${2 * a}, ${3 * a}…`, explain: steps(`Difference ${a}, so ${a}n`, `${a}n gives ${a}, ${2 * a}, ${3 * a}; the sequence is ${b < 0 ? `${-b} less` : `${b} more`}`, `nth term = ${ruleText(a, b)}`) }; },
      () => { const a = R(2, 9), b = R(-5, 9), k = pick([20, 30, 50, 100]); return { type: "num", html: `The nth term of a sequence is <strong>${ruleText(a, b)}</strong>. What is the ${k}th term?`, ans: a * k + b, hint: `Substitute n = ${k}.`, explain: steps(`${a} × ${k} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${a * k + b}`) }; },
      () => { const a = R(1, 15), d = R(2, 9); const t = [0, 1, 2, 3].map((k) => a + k * d); return { type: "num", html: `Find the missing term: <strong>${t[0]}, __, ${t[2]}, ${t[3]}</strong>`, ans: t[1], hint: "Find the difference between the last two terms.", explain: steps(`The difference is ${d}.`, `${t[0]} + ${d} = ${t[1]}`) }; },
    ],
    hard: [
      () => { const a = -R(2, 7), b = R(20, 45); const t = [1, 2, 3, 4].map((n) => a * n + b); return { type: "rule", html: `Find the nth term of <strong>${t.map(neg).join(", ")}, …</strong>`, ans: { a, b }, hint: `The sequence goes down by ${-a}, so start with −${-a}n.`, explain: steps(`Difference −${-a}, so −${-a}n`, `−${-a}n gives ${neg(a)}, ${neg(2 * a)}…; add ${b} to each`, `nth term = ${ruleText(a, b)}`) }; },
      () => { const a = R(3, 9), b = R(-6, 9), k = R(12, 40); return { type: "num", html: `Which term of the sequence <strong>${ruleText(a, b)}</strong> is equal to <strong>${a * k + b}</strong>?`, prefix: "n =", ans: k, hint: `Solve ${ruleText(a, b)} = ${a * k + b}.`, explain: steps(`${a}n = ${a * k + b} ${b < 0 ? "+" : "−"} ${Math.abs(b)} = ${a * k}`, `n = ${a * k} ÷ ${a} = ${k}`) }; },
      () => { const a = R(3, 9), b = R(-5, 9); const k = R(15, 50); const isIn = Math.random() < 0.5; const v = isIn ? a * k + b : a * k + b + R(1, a - 1); const n = (v - b) / a; return mc(`Is <strong>${v}</strong> a term of the sequence with nth term <strong>${ruleText(a, b)}</strong>?`, isIn ? `Yes: it's term ${k}` : "No", isIn ? ["No", `Yes: it's term ${k + 1}`, `Yes: it's term ${k - 1}`] : [`Yes: it's term ${Math.floor(n)}`, `Yes: it's term ${Math.ceil(n)}`, `Yes: it's term ${Math.round(n) + 2}`], `Solve ${ruleText(a, b)} = ${v}. Is n a whole number?`, steps(`${a}n = ${v} ${b < 0 ? "+" : "−"} ${Math.abs(b)} = ${v - b}`, `n = ${v - b} ÷ ${a} = ${+n.toFixed(2)}`, isIn ? "That's a whole number, so yes." : "That isn't a whole number, so no.")); },
    ],
  };

  const graphs = {
    easy: [
      () => { const m = R(-5, 6) || 2, c = R(-9, 9); return { type: "num", html: `What is the <strong>gradient</strong> of ${lineText(m, c)}?`, ans: m, hint: "In y = mx + c, the gradient is m: the number in front of x.", explain: steps(`${lineText(m, c)}: the number in front of x is ${neg(m)}.`) }; },
      () => { const m = R(-5, 6) || 3, c = R(-9, 9) || -4; return { type: "num", html: `Where does ${lineText(m, c)} cross the y-axis? Give the y value.`, prefix: "y =", ans: c, hint: "In y = mx + c, c is where the line crosses the y-axis.", explain: steps(`c = ${neg(c)}, so it crosses at (0, ${neg(c)}).`) }; },
      () => { const opts = shuffle([0.5, 1, 2, 3, 4, 5]).slice(0, 4).map((m) => [m, R(-6, 6)]); const steep = opts.reduce((a, b) => (b[0] > a[0] ? b : a)); return mc("Which line is the <strong>steepest</strong>?", lineText(steep[0], steep[1]), opts.filter((o) => o !== steep).map((o) => lineText(o[0], o[1])), "The steepest line has the biggest gradient (the number in front of x).", steps(`${lineText(steep[0], steep[1])} has gradient ${steep[0]}, the biggest.`)); },
    ],
    medium: [
      () => { const m = R(-4, 5) || 2, x1 = R(-4, 3), dx = R(1, 4), y1 = R(-5, 5); return { type: "num", html: `What is the gradient of the line through (${neg(x1)}, ${neg(y1)}) and (${neg(x1 + dx)}, ${neg(y1 + m * dx)})?`, ans: m, hint: "Gradient = change in y ÷ change in x.", explain: steps(`Change in y: ${neg(y1 + m * dx)} − ${P(y1)} = ${neg(m * dx)}`, `Change in x: ${neg(x1 + dx)} − ${P(x1)} = ${dx}`, `${neg(m * dx)} ÷ ${dx} = ${neg(m)}`) }; },
      () => { const m = R(-5, 6) || 4, c = R(-9, 9); return { type: "line", html: `Write the equation of the line with gradient <strong>${neg(m)}</strong> that crosses the y-axis at <strong>(0, ${neg(c)})</strong>.`, ans: { m, c }, hint: "Use y = mx + c: m is the gradient and c is the y-intercept.", explain: steps(`m = ${neg(m)}, c = ${neg(c)}`, lineText(m, c)) }; },
      () => { const m = R(-4, 5) || 2, c = R(-6, 6), x = R(-4, 5); const on = Math.random() < 0.5; const y = m * x + c + (on ? 0 : pick([1, -1, 2])); return mc(`Does the point <strong>(${neg(x)}, ${neg(y)})</strong> lie on ${lineText(m, c)}?`, on ? "Yes" : "No", [on ? "No" : "Yes", "Only if x is positive", "You can't tell without a graph"], `Substitute x = ${neg(x)} into the equation and see if you get y = ${neg(y)}.`, steps(`${neg(m)} × ${P(x)} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${neg(m * x + c)}`, on ? "That matches, so yes." : `That isn't ${neg(y)}, so no.`)); },
    ],
    hard: [
      () => { const m = R(-4, 5) || 3, c = R(-6, 6), px = R(-4, 5), py = R(-8, 8); const cn = py - m * px; return { type: "line", html: `Find the equation of the line <strong>parallel</strong> to ${lineText(m, c)} that passes through (${neg(px)}, ${neg(py)}).`, ans: { m, c: cn }, hint: `Parallel lines have the same gradient (${neg(m)}). Substitute the point to find c.`, explain: steps(`m = ${neg(m)}`, `${neg(py)} = ${neg(m)} × ${P(px)} + c, so c = ${neg(cn)}`, lineText(m, cn)) }; },
      () => { const m = pick([2, 3, -2, -3, 4, 0.5, -0.5, 0.25]); const ans = -1 / m; return { type: "num", html: `What is the gradient of a line <strong>perpendicular</strong> to ${lineText(m, R(-6, 6))}?`, ans, hint: "Perpendicular gradients multiply to −1: flip the gradient upside down and change its sign. Fractions like −1/3 are fine.", explain: steps(`${Lines.fmt(m)} × ${Lines.fmtP(ans)} = −1`, `So the gradient is ${Lines.fmt(ans)}.`) }; },
      () => { const m = R(-4, 5) || 2, c = R(-8, 8), x1 = R(-3, 2), x2 = x1 + R(1, 4); return { type: "line", html: `Find the equation of the line through (${neg(x1)}, ${neg(m * x1 + c)}) and (${neg(x2)}, ${neg(m * x2 + c)}).`, ans: { m, c }, hint: "First find the gradient (change in y ÷ change in x), then substitute a point to find c.", explain: steps(`Gradient = ${neg(m * (x2 - x1))} ÷ ${x2 - x1} = ${neg(m)}`, `${neg(m * x1 + c)} = ${neg(m)} × ${P(x1)} + c, so c = ${neg(c)}`, lineText(m, c)) }; },
    ],
  };

  const TOPICS = [
    { id: "arithmetic", name: "Arithmetic", room: "The Calculation Cellar", icon: "➕", gen: arithmetic },
    { id: "primes", name: "Primes & factors", room: "The Prime Vault", icon: "🏰", gen: primes },
    { id: "fractions", name: "Fractions", room: "The Fraction Kitchen", icon: "🍰", gen: fractions },
    { id: "standard-form", name: "Standard form", room: "The Observatory", icon: "🚀", gen: standardForm },
    { id: "expressions", name: "Expressions", room: "The Bracket Workshop", icon: "🧮", gen: expressions },
    { id: "equations", name: "Equations", room: "The Balance Room", icon: "⚖️", gen: equations },
    { id: "sequences", name: "Sequences", room: "The Pattern Library", icon: "🔁", gen: sequences },
    { id: "graphs", name: "Straight-line graphs", room: "The Map Room", icon: "📈", gen: graphs },
  ];

  return { TOPICS, F, V, toSF, sfHtml, fHtml, fracHtml, dec };
})();
