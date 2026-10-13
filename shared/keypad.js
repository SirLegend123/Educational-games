"use strict";
// An on-screen maths keypad for typing algebra: digits, +, −, letters and ².
// It types into whichever of the game's answer boxes was last selected. While
// it's showing, phones and tablets don't pop up their own keyboard (a real
// keyboard still works). Students can switch it off; the choice is remembered.
//
//   const pad = Keypad.create(document.getElementById("keypad"), {
//     inputs: () => [...document.querySelectorAll(".answer-box")],
//   });
//   pad.setLetters(["a", "b"]);   // letters needed for this question
//   pad.refresh();                // after adding or replacing answer boxes
const Keypad = (() => {
  const OFF_KEY = "keypadOff";
  const readOff = () => { try { return localStorage.getItem(OFF_KEY) === "1"; } catch { return false; } };
  const saveOff = (v) => { try { localStorage.setItem(OFF_KEY, v ? "1" : "0"); } catch { /* storage unavailable */ } };

  function create(container, { inputs, letters = ["x"] }) {
    let target = null;
    let off = readOff();
    let current = letters;

    container.classList.add("keypad-wrap");
    container.innerHTML = `<div class="keypad" role="group" aria-label="Maths keypad"></div>
      <button type="button" class="keypad-toggle"></button>`;
    const pad = container.querySelector(".keypad");
    const toggle = container.querySelector(".keypad-toggle");

    const usable = () => inputs().filter((i) => !i.disabled && i.offsetParent !== null);
    function getTarget() {
      const list = usable();
      return list.includes(target) ? target : list[0] || null;
    }

    // Insert text at the cursor (or replace the selection) and tell the game.
    function insert(text) {
      const el = getTarget();
      if (!el) return;
      const s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? el.value.length;
      el.value = el.value.slice(0, s) + text + el.value.slice(e);
      el.setSelectionRange(s + text.length, s + text.length);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.focus({ preventScroll: true });
    }
    function backspace() {
      const el = getTarget();
      if (!el) return;
      let s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? el.value.length;
      if (s === e && s > 0) s--;
      el.value = el.value.slice(0, s) + el.value.slice(e);
      el.setSelectionRange(s, s);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.focus({ preventScroll: true });
    }
    function clear() {
      const el = getTarget();
      if (!el) return;
      el.value = "";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.focus({ preventScroll: true });
    }
    function enter() {
      const el = getTarget();
      if (el && el.form) el.form.requestSubmit();
    }

    function key(label, action, cls = "", aria = label) {
      return { label, action, cls, aria };
    }
    function render() {
      const keys = [
        key("7", () => insert("7")), key("8", () => insert("8")), key("9", () => insert("9")), key("+", () => insert(" + "), "op", "plus"), key("⌫", backspace, "fn", "delete"),
        key("4", () => insert("4")), key("5", () => insert("5")), key("6", () => insert("6")), key("−", () => insert(" − "), "op", "minus"), key("C", clear, "fn", "clear"),
        key("1", () => insert("1")), key("2", () => insert("2")), key("3", () => insert("3")),
        key(current[0], () => insert(current[0]), "letter"), key("²", () => insert("²"), "letter", "squared"),
        key("0", () => insert("0")),
        ...current.slice(1).map((l) => key(l, () => insert(l), "letter")),
        key("✓", enter, "enter", "check answer"),
      ];
      pad.innerHTML = "";
      keys.forEach((k) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "key " + k.cls;
        b.textContent = k.label;
        b.setAttribute("aria-label", k.aria);
        // The last row is 0, any extra letters, then ✓ filling the rest.
        if (k.cls === "enter") b.style.gridColumn = `span ${Math.max(1, 5 - current.length)}`;
        // Keep the cursor in the answer box when a key is pressed.
        b.addEventListener("pointerdown", (e) => e.preventDefault());
        b.addEventListener("click", k.action);
        pad.appendChild(b);
      });
      pad.hidden = off;
      toggle.textContent = off ? "🔢 Show the keypad" : "⌨️ Use my keyboard instead";
      refresh();
    }

    // While the keypad shows, stop phones opening their own keyboard.
    function refresh() {
      for (const el of inputs()) {
        if (off) el.removeAttribute("inputmode");
        else el.setAttribute("inputmode", "none");
      }
    }

    document.addEventListener("focusin", (e) => { if (inputs().includes(e.target)) target = e.target; });
    toggle.addEventListener("click", () => {
      off = !off;
      saveOff(off);
      render();
      const el = getTarget();
      if (el) { el.blur(); el.focus(); }
    });

    render();
    return {
      setLetters(list) {
        if (list.join() === current.join()) return;
        current = list;
        render();
      },
      refresh,
    };
  }

  return { create };
})();
