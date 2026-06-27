import {
  createDefaultState,
  DEFAULT_MEMBER,
  DEFAULT_TRANSACTIONS,
  EXTRA_SAMPLE_TRANSACTIONS,
} from "./seed-data";
import type { AppState, MemberProfile, NotificationPrefs, Transaction } from "./types";
import { STORAGE_KEY, SESSION_KEY } from "./types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadState(): AppState {
  if (!isBrowser()) return createDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultState();
      saveState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppState;
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw) as { expiry: number };
      if (session.expiry > Date.now()) {
        parsed.isAuthenticated = true;
        parsed.sessionExpiry = session.expiry;
      }
    }
    return parsed;
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: AppState): void {
  if (!isBrowser()) return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      member: state.member,
      transactions: state.transactions,
      notificationPrefs: state.notificationPrefs,
    })
  );
}

export function setSession(expiryHours = 8): number {
  const expiry = Date.now() + expiryHours * 60 * 60 * 1000;
  if (isBrowser()) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ expiry }));
  }
  return expiry;
}

export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(SESSION_KEY);
}

export function updateMember(member: Partial<MemberProfile>): MemberProfile {
  const state = loadState();
  state.member = { ...state.member, ...member };
  saveState(state);
  return state.member;
}

export function updateNotificationPrefs(prefs: Partial<NotificationPrefs>): NotificationPrefs {
  const state = loadState();
  state.notificationPrefs = { ...state.notificationPrefs, ...prefs };
  saveState(state);
  return state.notificationPrefs;
}

export function addTransaction(txn: Transaction): void {
  const state = loadState();
  state.transactions.unshift(txn);
  if (txn.type === "credit") {
    state.member.balance += txn.amount;
  } else {
    state.member.balance -= txn.amount;
  }
  saveState(state);
}

export function resetToOriginalData(): AppState {
  const state = createDefaultState();
  saveState(state);
  clearSession();
  return state;
}

export function addMoreSampleTransactions(): Transaction[] {
  const state = loadState();
  const existingIds = new Set(state.transactions.map((t) => t.id));
  const newTxns = EXTRA_SAMPLE_TRANSACTIONS.filter((t) => !existingIds.has(t.id));
  state.transactions = [...newTxns, ...state.transactions];
  saveState(state);
  return newTxns;
}

export function replaceFullState(partial: {
  member?: MemberProfile;
  transactions?: Transaction[];
  notificationPrefs?: NotificationPrefs;
}): AppState {
  const state = loadState();
  if (partial.member) state.member = partial.member;
  if (partial.transactions) state.transactions = partial.transactions;
  if (partial.notificationPrefs) state.notificationPrefs = partial.notificationPrefs;
  saveState(state);
  return state;
}

export function getDefaultMemberForReset(): MemberProfile {
  return { ...DEFAULT_MEMBER };
}

export function getDefaultTransactionsForReset(): Transaction[] {
  return [...DEFAULT_TRANSACTIONS];
}