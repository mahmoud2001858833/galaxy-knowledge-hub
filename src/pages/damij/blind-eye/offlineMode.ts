// Simple online/offline watcher for Blind Eye.
// Lets the navigator fall back to local-only guidance when network is gone.

type Listener = (online: boolean) => void;

const listeners = new Set<Listener>();
let current = typeof navigator !== 'undefined' ? navigator.onLine : true;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { current = true; listeners.forEach(l => l(true)); });
  window.addEventListener('offline', () => { current = false; listeners.forEach(l => l(false)); });
}

export function isOnline(): boolean { return current; }

export function onConnectivityChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
