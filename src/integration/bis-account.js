// The game consumes only the public BIS package. Loading is independent of game startup.
const loadPackage = () => Promise.all([import('@bis/integration'), import('@bis/integration/style.css')]).then(([api]) => api);

export function createBisAccount({host, pauseController, restartGame, documentRef = globalThis.document,
  load = loadPackage, timeoutMs = 15000, onClose = () => {}}) {
  const overlay = documentRef.createElement('div');
  overlay.className = 'game-account-host'; overlay.hidden = true; overlay.tabIndex = -1;
  const status = documentRef.createElement('section'); status.className = 'game-account-status';
  status.setAttribute('role', 'dialog'); status.setAttribute('aria-label', 'Account loading');
  const message = documentRef.createElement('p'); message.setAttribute('role', 'status');
  const back = documentRef.createElement('button'); back.type = 'button'; back.textContent = 'Back to Settings';
  status.append(message, back);
  const mount = documentRef.createElement('div'); mount.className = 'game-account-mount';
  overlay.append(status, mount);
  const overlayParent = () => documentRef.fullscreenElement ?? documentRef.body ?? host;
  overlayParent().append(overlay);
  let disposed = false, active = false, visit = 0, restarting = false, session, initialization;
  const restarts = new Set(); const inertBefore = new Map();
  const focusables = () => [...overlay.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"]')].filter(el => !el.closest('[hidden]') && el.getClientRects().length);
  const focusInside = () => (focusables()[0] ?? overlay).focus();
  const keepFocus = event => { if (active && !overlay.contains(event.target)) focusInside(); };
  const keydown = event => {
    if (event.key === 'Tab') {
      const items = focusables(), index = items.indexOf(documentRef.activeElement);
      if (!items.length || index < 0 || (!event.shiftKey && index === items.length - 1) || (event.shiftKey && index === 0)) {
        event.preventDefault(); (event.shiftKey ? items.at(-1) : items[0])?.focus();
      }
    }
    // BIS owns Escape and its operation guards. Never turn it into a host close.
    event.stopPropagation();
  };
  const stop = event => event.stopPropagation();
  overlay.addEventListener('keydown', keydown);
  for (const type of ['keyup','pointerdown','pointerup','click','touchstart','touchend']) overlay.addEventListener(type, stop);
  function restoreInteraction() {
    for (const [element, value] of inertBefore) element.inert = value;
    inertBefore.clear();
  }
  function blockInteraction() {
    // Walk to the document root so canvas, controls and Settings are all inactive.
    for (let branch = overlay; branch; branch = branch.parentElement) {
      const parent = branch.parentElement ?? (branch === overlay ? host : null);
      for (const child of parent?.children ?? []) if (child !== branch) {
        inertBefore.set(child, child.inert); child.inert = true;
      }
    }
  }
  function moveOverlay() {
    restoreInteraction(); overlayParent().append(overlay);
    if (active) { blockInteraction(); focusInside(); }
  }
  documentRef.addEventListener('fullscreenchange', moveOverlay);
  function close() {
    if (!active || restarting) return;
    active = false; visit++; overlay.hidden = true;
    documentRef.removeEventListener('focusin', keepFocus, true);
    restoreInteraction();
    onClose();
    pauseController.resume('bis-account');
  }
  back.addEventListener('click', close);
  const cleanup = current => { current?.unsubscribe?.(); current?.unsubscribeEvents?.(); current?.ui?.unmount(); current?.context?.dispose(); };
  function initialize() {
    if (initialization) return initialization;
    initialization = (async () => {
      const api = await load(); if (disposed) return;
      const current = {context: api.createBisContext()}; session = current;
      current.unsubscribeEvents = current.context.onEvent(event => {
        if (disposed || event.type !== 'restartRequested' || restarts.has(event.logoutId)) return;
        restarts.add(event.logoutId); restarting = true;
        pauseController.pause('bis-account');
        try { restartGame(); }
        catch { status.hidden = false; mount.hidden = true; message.textContent = 'Account logged out. Reload the game to continue.'; back.hidden = true; }
      });
      let lastView = current.context.getState().view;
      current.unsubscribe = current.context.subscribe(() => {
        const previousView = lastView; lastView = current.context.getState().view;
        if (!active || previousView !== 'account' || lastView !== 'empty') return;
        // restartRequested follows the state publication in the same turn.
        queueMicrotask(() => { if (active && !restarting && current.context.getState().view === 'empty') close(); });
      });
      await current.context.ready(); if (disposed) return;
      current.ui = api.createBisUi(current.context); current.ui.mount(mount);
      return current;
    })().catch(error => { cleanup(session); session = undefined; initialization = undefined; throw error; });
    return initialization;
  }
  async function open() {
    if (disposed || active || restarting) return;
    active = true; const currentVisit = ++visit;
    pauseController.pause('bis-account');
    blockInteraction();
    overlay.hidden = false; status.hidden = true; mount.hidden = true; message.textContent = '';
    documentRef.addEventListener('focusin', keepFocus, true); overlay.focus();
    let timer;
    try {
      const current = await Promise.race([initialize(), new Promise((_, reject) => { timer = setTimeout(() => reject(Error('timeout')), timeoutMs); })]);
      if (disposed || !active || visit !== currentVisit || !current) return;
      current.context.openAccountDialog(); status.hidden = true; mount.hidden = false;
      queueMicrotask(() => { if (active && visit === currentVisit) focusInside(); });
    } catch { if (!disposed && active && visit === currentVisit) { status.hidden = false; message.textContent = 'Account is unavailable. Return to Settings and try again.'; back.focus(); } }
    finally { clearTimeout(timer); }
  }
  return {open, get isOpen() { return active; }, dispose() {
    if (disposed) return; disposed = true; restarting = false; close();
    documentRef.removeEventListener('fullscreenchange', moveOverlay);
    cleanup(session); overlay.remove();
  }};
}
