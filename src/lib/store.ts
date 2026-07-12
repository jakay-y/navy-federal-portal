import {
  createDefaultState,
  DEFAULT_MEMBER,
  DEFAULT_STOCKS,
  DEFAULT_TRANSACTIONS,
  EXTRA_SAMPLE_TRANSACTIONS,
} from "./seed-data";
import type {
  AppState,
  MemberProfile,
  NotificationPrefs,
  StockHolding,
  Transaction,
  TransactionStatus,
} from "./types";
import { generateReferenceNumber } from "./format";
import type { AccountType } from "./types";
import { STORAGE_KEY, SESSION_KEY } from "./types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function migrateMember(member: Partial<MemberProfile> | undefined): MemberProfile {
  const migrated = { ...DEFAULT_MEMBER, ...member };
  if (migrated.balance !== undefined && migrated.checkingBalance === undefined) {
    migrated.checkingBalance = migrated.balance;
    migrated.savingsBalance = migrated.savingsBalance ?? 18340;
    delete migrated.balance;
  }
  if (migrated.checkingBalance === undefined) migrated.checkingBalance = DEFAULT_MEMBER.checkingBalance;
  if (migrated.savingsBalance === undefined) migrated.savingsBalance = DEFAULT_MEMBER.savingsBalance;
  if (migrated.creditScore === undefined) migrated.creditScore = DEFAULT_MEMBER.creditScore;
  if (!migrated.accessPin) migrated.accessPin = DEFAULT_MEMBER.accessPin;
  if (!migrated.savingsAccountNumber) migrated.savingsAccountNumber = DEFAULT_MEMBER.savingsAccountNumber;
  if (migrated.cashAppConnected === undefined) migrated.cashAppConnected = false;
  if (!migrated.cashAppTag) migrated.cashAppTag = "";
  if (!migrated.heloc) migrated.heloc = { status: "none" };
  if (migrated.avatarUrl === "/avatars/ciro-ballard.jpg") migrated.avatarUrl = "";
  return migrated;
}

function applyBalanceChange(member: MemberProfile, txn: Transaction, direction: 1 | -1): void {
  const account = txn.accountType ?? "checking";
  const delta = txn.amount * direction;
  if (txn.type === "credit") {
    if (account === "savings") member.savingsBalance += delta;
    else member.checkingBalance += delta;
  } else {
    if (account === "savings") member.savingsBalance -= delta;
    else member.checkingBalance -= delta;
  }
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
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const state: AppState = {
      ...createDefaultState(),
      ...parsed,
      member: migrateMember(parsed.member),
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [...DEFAULT_TRANSACTIONS],
      stocks: parsed.stocks?.length ? parsed.stocks : [...DEFAULT_STOCKS],
      notificationPrefs: parsed.notificationPrefs ?? createDefaultState().notificationPrefs,
    };

    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw) as { expiry: number };
      if (session.expiry > Date.now()) {
        state.isAuthenticated = true;
        state.sessionExpiry = session.expiry;
      }
    }
    return state;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    const initial = createDefaultState();
    saveState(initial);
    return initial;
  }
}

export function saveState(state: AppState): void {
  if (!isBrowser()) return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      member: state.member,
      transactions: state.transactions,
      stocks: state.stocks,
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
  state.member = migrateMember({ ...state.member, ...member });
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
  if (txn.status === "completed") {
    applyBalanceChange(state.member, txn, 1);
  }
  saveState(state);
}

export function updateTransactionStatus(id: string, status: TransactionStatus): Transaction | null {
  const state = loadState();
  const txn = state.transactions.find((t) => t.id === id);
  if (!txn) return null;

  const prev = txn.status;
  txn.status = status;

  if (prev === "completed" && status !== "completed") {
    applyBalanceChange(state.member, txn, -1);
  } else if (prev !== "completed" && status === "completed") {
    applyBalanceChange(state.member, txn, 1);
  }

  saveState(state);
  return txn;
}

export function setTransactionHold(id: string, onHold: boolean): Transaction | null {
  const txn = updateTransactionStatus(id, onHold ? "on_hold" : "pending");
  if (txn && !onHold && txn.status === "pending") {
    return txn;
  }
  return txn;
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
  stocks?: StockHolding[];
  notificationPrefs?: NotificationPrefs;
}): AppState {
  const state = loadState();
  if (partial.member) state.member = migrateMember(partial.member);
  if (partial.transactions) state.transactions = partial.transactions;
  if (partial.stocks) state.stocks = partial.stocks;
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

export function updateTransactionDetails(
  id: string,
  updates: Partial<Transaction>
): Transaction | null {
  const state = loadState();
  const txn = state.transactions.find((t) => t.id === id);
  if (!txn) return null;

  const snapshot: Transaction = { ...txn };

  if (snapshot.status === "completed") {
    applyBalanceChange(state.member, snapshot, -1);
  }

  Object.assign(txn, updates);

  if (txn.status === "completed") {
    applyBalanceChange(state.member, txn, 1);
  }

  saveState(state);
  return txn;
}

export function deleteTransaction(id: string): boolean {
  const state = loadState();
  const idx = state.transactions.findIndex((t) => t.id === id);
  if (idx === -1) return false;

  const txn = state.transactions[idx];
  if (txn.status === "completed") {
    applyBalanceChange(state.member, txn, -1);
  }

  state.transactions.splice(idx, 1);
  saveState(state);
  return true;
}

export function createAdminTransaction(txn: Transaction): Transaction {
  const state = loadState();
  state.transactions.unshift(txn);
  if (txn.status === "completed") {
    applyBalanceChange(state.member, txn, 1);
  }
  saveState(state);
  return txn;
}

export function purchaseStock(params: {
  ticker: string;
  name: string;
  shares: number;
  pricePerShare: number;
  accountType: AccountType;
}): { transaction: Transaction; newBalance: number } {
  const state = loadState();
  const totalCost = Math.round(params.shares * params.pricePerShare * 100) / 100;
  const balanceField = params.accountType === "checking" ? "checkingBalance" : "savingsBalance";

  if (totalCost <= 0) throw new Error("Invalid purchase amount");
  if (state.member[balanceField] < totalCost) throw new Error("Insufficient funds");

  state.member[balanceField] = Math.round((state.member[balanceField] - totalCost) * 100) / 100;

  const holding = state.stocks.find((s) => s.ticker === params.ticker);
  if (holding) {
    holding.shares += params.shares;
    holding.price = params.pricePerShare;
  } else {
    state.stocks.push({
      ticker: params.ticker,
      name: params.name,
      price: params.pricePerShare,
      change: 0,
      pctChange: 0,
      shares: params.shares,
    });
  }

  const transaction: Transaction = {
    id: `txn-${Date.now()}`,
    date: new Date().toISOString(),
    description: `Stock Purchase — ${params.ticker} (${params.shares} shares)`,
    amount: totalCost,
    type: "debit",
    category: "Investments",
    status: "completed",
    referenceNumber: generateReferenceNumber(),
    accountType: params.accountType,
  };

  state.transactions.unshift(transaction);
  saveState(state);

  return { transaction, newBalance: state.member[balanceField] };
}