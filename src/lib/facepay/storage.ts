// FacePay local storage manager
export type PasswordType = 'smile' | 'blinks';

export interface FacePayTx {
  id: string;
  productName: string;
  amount: number;
  date: string;
}

export interface FacePayAccount {
  name: string;
  balance: number;
  faceEmbedding: number[];
  passwordType: PasswordType;
  createdAt: string;
  history: FacePayTx[];
}

const KEY = 'facepay_account_v1';

export const loadAccount = (): FacePayAccount | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FacePayAccount) : null;
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

export const addTransaction = (productName: string, amount: number): FacePayAccount | null => {
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
  saveAccount(acc);
  return acc;
};
