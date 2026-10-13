"use strict";
// An on-screen maths keypad, so tablets and phones don't need their own
// keyboard (which can cover half the screen). It types into whichever of the
// game's answer boxes was last selected, and hides itself when no answer box
// is in use. A physical keyboard still works. Students can switch it off;
// the choice is remembered across all the games.
//
//   const pad = Keypad.create(document.getElementById("keypad"), {
//     inputs: () => [document.getElementById("ans")],
//     keys: [Keypad.key("+", " + "), Keypad.key("−", " − "), Keypad.letter("x"), Keypad.key("²")],
//   });
//   pad.setKeys([...]);   // change the extra keys for a new question
//
// The digits, ⌫, C (clear) and ✓ (check) are always there. Up to seven extra
// keys fill the spare places: the fourth column of the first three rows, the
// end of the third row, then the bottom row before ✓.
const Keypad = (() => {
  const OFF_KEY = "keypadOff";
  const readOff = () => { try { return localStorage.getItem(OFF_KEY) === "1"; } catch { return false; } };
  const saveOff = (v) => { try { localStorage.setItem(OFF_KEY, v ? "1" : "0"); } catch { /* storage unavailable */ } };

  const CSS = `
.keypad-wrap { max-width: 360px; margin: 12px auto 0; }
.keypad { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.keypad .key {
  font: inherit; font-size: 1.3rem; font-weight: 700; padding: 10px 0; min-height: 48px; cursor: pointer;
  border-radius: 10px; background: var(--panel-2, #1a2d5e); color: var(--text, #e8eefc); border: 1px solid var(--line, #2f4a8f);
  font-family: ui-monospace, "SF Mono", Consolas, monospace; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
}
.keypad .key:focus { outline: none; }
.keypad .key:focus-visible { outline: 2px solid var(--p1, #3ddcff); outline-offset: 2px; }
.keypad .key:active { transform: translateY(1px); filter: brightness(1.35); }
.keypad .key.op { color: var(--gold, #ffb703); }
.keypad .key.letter { color: var(--p1, #3ddcff); font-style: italic; }
.keypad .key.fn { color: var(--muted, #a3b3da); font-family: system-ui, sans-serif; font-size: 1.1rem; }
.keypad .key.word { font-family: system-ui, sans-serif; font-size: 1rem; }
.keypad .key.enter { background: var(--good, #4ade80); color: #052e16; border-color: transparent; }
.keypad-toggle {
  display: block; margin: 8px auto 0; background: none; border: 0; color: var(--muted, #a3b3da);
  font: inherit; font-size: .9rem; font-weight: 600; padding: 4px 8px; cursor: pointer;
}
.keypad-toggle:hover { color: var(--text, #e8eefc); }
.keypad-wrap[hidden], .keypad[hidden] { display: none !important; }`;

  function addStyles() {
    if (document.getElementById("keypad-styles")) return;
    const style = document.createElement("style");
    style.id = "keypad-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Key helpers: key(label, text to insert, style), letter("x").
  const key = (label, insert = label, cls = "op", aria = label) => ({ label, insert, cls, aria });
  const letter = (l) => key(l, l, "letter");

  // Grid places [row, column] for the extra keys, in order.
  const SLOTS = [[1, 4], [2, 4], [3, 4], [3, 5], [4, 2], [4, 3], [4, 4]];

  function create(container, { inputs, keys = [] }) {
    addStyles();
    let target = null;
    let off = readOff();
    let extras = keys;

    container.classList.add("keypad-wrap");
    container.innerHTML = `<div class="keypad" role="group" aria-label="Maths keypad"></div>
      <button type="button" class="keypad-toggle"></button>`;
    const pad = container.querySelector(".keypad");
    const toggle = container.querySelector(".keypad-toggle");

    const usable = () => inputs().filter((i) => i && !i.disabled && i.offsetParent !== null);
    function getTarget() {
      const list = usable();
      return list.includes(target) ? target : list[0] || null;
    }
    function changed(el) {
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.focus({ preventScroll: true });
    }
    // Insert text at the cursor (or over the selection).
    function insert(text) {
      const el = getTarget();
      if (!el) return;
      const s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? el.value.length;
      // Don't double up spaces around operators like " + ".
      if (text.startsWith(" ") && (s === 0 || el.value[s - 1] === " ")) text = text.slice(1);
      el.value = el.value.slice(0, s) + text + el.value.slice(e);
      el.setSelectionRange(s + text.length, s + text.length);
      changed(el);
    }
    function backspace() {
      const el = getTarget();
      if (!el) return;
      let s = el.selectionStart ?? el.value.length;
      const e = el.selectionEnd ?? el.value.length;
      if (s === e && s > 0) {
        s--;
        // Remove a spaced operator like " + " in one go.
        if (el.value[s] === " " && s >= 2 && el.value[s - 2] === " ") s -= 2;
      }
      el.value = el.value.slice(0, s) + el.value.slice(e);
      el.setSelectionRange(s, s);
      changed(el);
    }
    function clear() {
      const el = getTarget();
      if (!el) return;
      el.value = "";
      changed(el);
    }
    function enter() {
      const el = getTarget();
      if (el && el.form) el.form.requestSubmit();
    }

    function button(label, action, cls, aria, row, col, span = 1) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "key " + cls;
      b.textContent = label;
      b.setAttribute("aria-label", aria);
      b.style.gridRow = String(row);
      b.style.gridColumn = `${col} / span ${span}`;
      // Keep the cursor in the answer box when a key is pressed.
      b.addEventListener("pointerdown", (e) => e.preventDefault());
      b.addEventListener("click", action);
      pad.appendChild(b);
    }

    function render() {
      pad.innerHTML = "";
      [["7", "8", "9"], ["4", "5", "6"], ["1", "2", "3"]].forEach((row, r) =>
        row.forEach((d, c) => button(d, () => insert(d), "", d, r + 1, c + 1)));
      button("⌫", backspace, "fn", "delete", 1, 5);
      button("C", clear, "fn", "clear", 2, 5);
      const used = extras.slice(0, SLOTS.length);
      used.forEach((k, i) => button(k.label, () => insert(k.insert), k.cls, k.aria, SLOTS[i][0], SLOTS[i][1]));
      // With few extra keys, lay out like a calculator: a wide 0 and a tall ✓.
      if (used.length <= 3) {
        const wide = used.length <= 2 ? 3 : 4;
        button("0", () => insert("0"), "", "0", 4, 1, wide);
        button("✓", enter, "enter", "check answer", 3, wide + 1, 5 - wide);
        pad.lastChild.style.gridRow = "3 / span 2";
      } else {
        button("0", () => insert("0"), "", "0", 4, 1);
        const onLastRow = used.length - 4;
        button("✓", enter, "enter", "check answer", 4, 2 + onLastRow, 4 - onLastRow);
      }
      pad.hidden = off;
      toggle.textContent = off ? "🔢 Show the keypad" : "⌨️ Use my keyboard instead";
      refresh();
    }

    // Show the keypad only while an answer box is in use, and stop phones
    // and tablets opening their own keyboard while it shows.
    function refresh() {
      for (const el of inputs()) {
        if (!el) continue;
        if (off) el.removeAttribute("inputmode");
        else if (el.getAttribute("inputmode") !== "none") el.setAttribute("inputmode", "none");
      }
      const show = usable().length > 0;
      if (container.hidden === show) container.hidden = !show;
    }

    document.addEventListener("focusin", (e) => { if (inputs().includes(e.target)) target = e.target; });
    toggle.addEventListener("click", () => {
      off = !off;
      saveOff(off);
      render();
      const el = getTarget();
      if (el) { el.blur(); el.focus(); }
    });
    // Answer boxes appear, disappear and get disabled as the game goes on.
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; refresh(); });
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "disabled", "class", "style"] });

    render();
    return {
      setKeys(list) {
        if (list.map((k) => k.label).join() === extras.map((k) => k.label).join()) return;
        extras = list;
        render();
      },
      refresh,
    };
  }

  return { create, key, letter };
})();
