// Brief click shield to absorb the iOS ghost click that fires ~300 ms after a
// touch that closes a modal. The close button is gone by the time the OS
// click resolves, so without this the click lands on whatever button is now
// under the finger. Each modal close handler calls shieldClicksBriefly() to
// extend the window; installClickShield() is registered once from main.js.
//
// Scope: only `click` events are intercepted (not pointerdown/touchstart),
// since the touch bridge needs those raw events to track gestures and the
// ghost we're guarding against is itself a delayed synthetic `click`.
//
// Sequence note: when a touch on a close button fires, the bridge dispatches
// its synthetic click first; that click runs through capture (shield sees
// shieldUntil = 0 and lets it pass) before the onclick handler arms the
// shield. The follow-up OS ghost click ~300 ms later then trips the shield.
// Result: the click that closes the modal is never self-blocked.
//
// Untrusted clicks (synthetic ones the touch bridge dispatches for new taps
// during the shield window) are always allowed so a deliberate immediate
// tap on a different button still works through the bridge.

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
