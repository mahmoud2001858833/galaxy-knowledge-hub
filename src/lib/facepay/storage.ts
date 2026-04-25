// FacePay local storage manager
export type PasswordType = 'smile' | 'blinks';

export interface FacePayTx {
  id: string;
  productName: string;
  amount: number;
  date: string;
}

export type AttemptStatus = 'success' | 'failed';
export type AttemptReason =
  | 'face_mismatch'
  | 'gesture_failed'
  | 'cancelled'
  | 'insufficient_balance'
  | 'success';

export interface FacePayAttempt {
  id: string;
  productName: string;
  productId?: string;
  amount: number;
  date: string;
  status: AttemptStatus;
  reason: AttemptReason;
}

export interface FacePayAccount {
  name: string;
  balance: number;
  faceEmbedding: number[];
  passwordType: PasswordType;
  createdAt: string;
  history: FacePayTx[];
  attempts?: FacePayAttempt[];
}

const KEY = 'facepay_account_v1';

export const loadAccount = (): FacePayAccount | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const acc = JSON.parse(raw) as FacePayAccount;
    if (!acc.attempts) acc.attempts = [];
    return acc;
  } catch {
    return null;
  }
};

export const saveAccount = (acc: FacePayAccount): void => {
  localStorage.setItem(KEY, JSON.stringify(acc));
};

export const deleteAccount = (): void => {
  localStorage.removeItem(KEY);
};

export const logAttempt = (
  productName: string,
  amount: number,
  status: AttemptStatus,
  reason: AttemptReason,
  productId?: string,
): FacePayAccount | null => {
  const acc = loadAccount();
  if (!acc) return null;
  const att: FacePayAttempt = {
    id: crypto.randomUUID(),
    productName,
    productId,
    amount,
    date: new Date().toISOString(),
    status,
    reason,
  };
  acc.attempts = [att, ...(acc.attempts || [])].slice(0, 50);
  saveAccount(acc);
  return acc;
};

export const addTransaction = (productName: string, amount: number, productId?: string): FacePayAccount | null => {
  const acc = loadAccount();
  if (!acc) return null;
  const tx: FacePayTx = {
    id: crypto.randomUUID(),
    productName,
    amount,
    date: new Date().toISOString(),
  };
  acc.balance = Math.max(0, acc.balance - amount);
  acc.history = [tx, ...(acc.history || [])].slice(0, 50);
  // also log a successful attempt
  const att: FacePayAttempt = {
    id: crypto.randomUUID(),
    productName,
    productId,
    amount,
    date: new Date().toISOString(),
    status: 'success',
    reason: 'success',
  };
  acc.attempts = [att, ...(acc.attempts || [])].slice(0, 50);
  saveAccount(acc);
  return acc;
};

