export type TransactionType = "credit" | "debit";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  status: TransactionStatus;
  referenceNumber: string;
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
  routingNumber: string;
  balance: number;
  phone: string;
  email: string;
  password: string;
  avatarUrl: string;
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
  notificationPrefs: NotificationPrefs;
  isAuthenticated: boolean;
  sessionExpiry: number | null;
}

export const STORAGE_KEY = "nfcu-member-portal-v1";
export const SESSION_KEY = "nfcu-session-v1";
export const ADMIN_PASSWORD = "admin2026";
export const DEMO_OTP = "123456";