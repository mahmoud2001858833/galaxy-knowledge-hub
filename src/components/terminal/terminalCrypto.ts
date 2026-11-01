/**
 * Browser side of the terminal's signing scheme. Must match public/zarwa-bridge.mjs:
 *   authKey   = hex(HMAC-SHA256(deviceSecret, "zarwa-bridge-auth"))   — the bridge's login key
 *   auth_hash = hex(SHA-256(authKey))                                 — the only thing stored in the DB
 *   signature = hex(HMAC-SHA256(deviceSecret, id \n device \n target \n resume \n issuedAt \n prompt))
 */

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export const hmacHex = async (secret: string, message: string) => {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
};

export const sha256Hex = async (text: string) => hex(await crypto.subtle.digest('SHA-256', enc.encode(text)));

const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const newDeviceSecret = () => base64url(crypto.getRandomValues(new Uint8Array(32)));

export const authHashFor = async (secret: string) => sha256Hex(await hmacHex(secret, 'zarwa-bridge-auth'));

export interface SignableJob {
  id: string;
  target: 'claude' | 'antigravity';
  resume_session: string | null;
  issued_at: number;
  prompt: string;
}

export const signJob = (secret: string, deviceId: string, job: SignableJob) =>
  hmacHex(secret, [job.id, deviceId, job.target, job.resume_session ?? '', String(job.issued_at), job.prompt].join('\n'));

/** One-line code the bridge's `pair` command reads. */
export const pairingCode = (supabaseUrl: string, anonKey: string, deviceId: string, secret: string) => {
  const json = JSON.stringify({ u: supabaseUrl, k: anonKey, d: deviceId, s: secret });
  return base64url(enc.encode(json));
};

// The device secret stays in this browser only (never sent to the server).
const storageKey = (deviceId: string) => `zarwa_terminal_secret_${deviceId}`;
export const saveSecret = (deviceId: string, secret: string) => {
  try {
    localStorage.setItem(storageKey(deviceId), secret);
  } catch {
    /* private mode: the user can paste the secret again */
  }
};
export const loadSecret = (deviceId: string) => {
  try {
    return localStorage.getItem(storageKey(deviceId));
  } catch {
    return null;
  }
};
export const forgetSecret = (deviceId: string) => {
  try {
    localStorage.removeItem(storageKey(deviceId));
  } catch {
    /* ignore */
  }
};
