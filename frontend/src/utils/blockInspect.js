import { TOKEN_KEY } from '../services/api';

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

// Logs out / hides the app as soon as devtools is open (no debugger pause).
function isTouchDevice() {
  return (
    navigator.maxTouchPoints > 0 ||
    window.matchMedia?.('(pointer: coarse)').matches ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );
}

export function guardDevtools() {
  if (!import.meta.env.PROD || isTouchDevice()) return;

  const overlay = document.createElement('div');
  overlay.textContent = 'Inspecting is disabled on this site.';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;' +
    'background:#0b0b14;color:#fff;font:600 18px system-ui,sans-serif;text-align:center;padding:24px;';
  document.body.appendChild(overlay);

  const check = () => {
    if (!window.outerWidth || !window.outerHeight) return;

    const open =
      window.outerWidth - window.innerWidth > 200 ||
      window.outerHeight - window.innerHeight > 250;

    // Signed in? Log out and reload. Already logged out? Just keep the page hidden.
    if (open && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.replace('/login');
      return;
    }

    overlay.style.display = open ? 'flex' : 'none';
    document.getElementById('root').style.visibility = open ? 'hidden' : 'visible';
  };

  check();
  setInterval(check, 500);
  window.addEventListener('resize', check);
}
