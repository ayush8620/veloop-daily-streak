// Blocks right-click and the usual devtools shortcuts in production builds.
export function blockInspect() {
  if (!import.meta.env.PROD) return;

  document.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    const ctrl = e.ctrlKey || e.metaKey;

    if (
      key === 'F12' ||
      (ctrl && e.shiftKey && ['I', 'J', 'C'].includes(key)) ||
      (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(key)) ||
      (ctrl && key === 'U')
    ) {
      e.preventDefault();
    }
  });
}

// Hides the app while devtools looks open (docked panel or paused debugger).
export function guardDevtools() {
  if (!import.meta.env.PROD) return;

  const overlay = document.createElement('div');
  overlay.textContent = 'Inspecting is disabled on this site.';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;' +
    'background:#0b0b14;color:#fff;font:600 18px system-ui,sans-serif;text-align:center;padding:24px;';
  document.body.appendChild(overlay);

  const check = () => {
    const docked =
      window.outerWidth - window.innerWidth > 160 ||
      window.outerHeight - window.innerHeight > 160;

    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    const paused = performance.now() - start > 100;

    const open = docked || paused;
    overlay.style.display = open ? 'flex' : 'none';
    document.getElementById('root').style.visibility = open ? 'hidden' : 'visible';
  };

  setInterval(check, 1000);
}
