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
