// Brief click shield to absorb the iOS "ghost click" — the synthetic click
// Safari dispatches ~300 ms after a tap. Changing the Text size or Font reflows
// the page as glyph metrics shift, so a control can slide under the finger
// between the tap and that delayed click, which then lands on the wrong button.
// setSize()/setFont() call shieldClicksBriefly() right after they change
// layout; installClickShield() registers the capture-phase guard once at start.
//
// Only `click` events are intercepted (not pointer/touch), and only inside the
// short window after a reflow. The click that triggered the change has already
// passed through capture before the shield is armed (shieldUntil is still 0),
// so it is never self-blocked; only the follow-up ghost click trips the guard.
// Untrusted (programmatic) clicks are always allowed so deliberate scripted
// clicks keep working.

let shieldUntil = 0;

export function shieldClicksBriefly(ms = 350) {
  const target = Date.now() + ms;
  if (target > shieldUntil) shieldUntil = target;
}

export function installClickShield() {
  document.addEventListener('click', (event) => {
    if (Date.now() >= shieldUntil) return;
    if (!event.isTrusted) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);
}
