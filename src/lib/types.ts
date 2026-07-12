export type TransactionType = "credit" | "debit";
export type TransactionStatus = "completed" | "pending" | "failed" | "on_hold" | "declined";
export type AccountType = "checking" | "savings";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  status: TransactionStatus;
  referenceNumber: string;
  accountType?: AccountType;
}

export interface StockHolding {
  ticker: string;
  name: string;
  price: number;
  change: number;
  pctChange: number;
  shares: number;
}

export interface HelocApplication {
  status: "none" | "draft" | "submitted" | "under_review" | "approved";
  requestedAmount?: number;
  propertyValue?: number;
  submittedAt?: string;
}

export interface MemberProfile {
  firstName: string;
  lastName: string;
  dob: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  sex: string;
  height: string;
  weight: string;
  hair: string;
  eyes: string;
  idNumber: string;
  idIssueDate: string;
  idExpiryDate: string;
  memberSince: string;
  accountNumber: string;
  savingsAccountNumber: string;
  routingNumber: string;
  checkingBalance: number;
  savingsBalance: number;
  creditScore: number;
  phone: string;
  email: string;
  password: string;
  accessPin: string;
  avatarUrl: string;
  cashAppConnected: boolean;
  cashAppTag: string;
  heloc: HelocApplication;
  /** @deprecated migrated to checkingBalance */
  balance?: number;
}

export interface NotificationPrefs {
  emailAlerts: boolean;
  smsAlerts: boolean;
  transactionAlerts: boolean;
  marketingEmails: boolean;
}

export interface AppState {
  member: MemberProfile;
  transactions: Transaction[];
  stocks: StockHolding[];
  notificationPrefs: NotificationPrefs;
  isAuthenticated: boolean;
  sessionExpiry: number | null;
}

export const STORAGE_KEY = "nfcu-member-portal-v1";
export const SESSION_KEY = "nfcu-session-v1";
export const ADMIN_PASSWORD = "admin2026";
export const DEMO_ACCESS_PIN = "129012";
/** Permanent COT code — required to approve transfers in admin and complete member transfers */
export const TRANSFER_COT_CODE = "784291";

export function getTotalBalance(member: MemberProfile): number {
  return member.checkingBalance + member.savingsBalance;
}