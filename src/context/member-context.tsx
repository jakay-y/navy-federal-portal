"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createDefaultState } from "@/lib/seed-data";
import {
  addMoreSampleTransactions,
  addTransaction,
  clearSession,
  loadState,
  purchaseStock,
  resetToOriginalData,
  saveState,
  setSession,
  setTransactionHold,
  updateMember,
  updateNotificationPrefs,
  updateTransactionStatus,
} from "@/lib/store";
import type {
  AccountType,
  AppState,
  MemberProfile,
  NotificationPrefs,
  StockHolding,
  Transaction,
  TransactionStatus,
} from "@/lib/types";

interface MemberContextValue extends AppState {
  hydrated: boolean;
  login: () => void;
  logout: () => void;
  updateMemberProfile: (data: Partial<MemberProfile>) => void;
  updatePrefs: (prefs: Partial<NotificationPrefs>) => void;
  createTransaction: (txn: Transaction) => void;
  buyStock: (params: {
    ticker: string;
    name: string;
    shares: number;
    pricePerShare: number;
    accountType: AccountType;
  }) => { transaction: Transaction; newBalance: number };
  changeTransactionStatus: (id: string, status: TransactionStatus) => void;
  holdTransaction: (id: string, onHold: boolean) => void;
  resetData: () => AppState;
  addSamples: () => void;
  setFullMember: (member: MemberProfile) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setStocks: (stocks: StockHolding[]) => void;
  refresh: () => void;
}

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(createDefaultState);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
  }, [refresh]);

  const login = useCallback(() => {
    const expiry = setSession();
    setState((prev) => ({ ...prev, isAuthenticated: true, sessionExpiry: expiry }));
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setState((prev) => ({ ...prev, isAuthenticated: false, sessionExpiry: null }));
  }, []);

  const updateMemberProfile = useCallback((data: Partial<MemberProfile>) => {
    const member = updateMember(data);
    setState((prev) => ({ ...prev, member }));
  }, []);

  const updatePrefs = useCallback((prefs: Partial<NotificationPrefs>) => {
    const notificationPrefs = updateNotificationPrefs(prefs);
    setState((prev) => ({ ...prev, notificationPrefs }));
  }, []);

  const createTransaction = useCallback((txn: Transaction) => {
    addTransaction(txn);
    refresh();
  }, [refresh]);

  const buyStock = useCallback(
    (params: {
      ticker: string;
      name: string;
      shares: number;
      pricePerShare: number;
      accountType: AccountType;
    }) => {
      const result = purchaseStock(params);
      refresh();
      return result;
    },
    [refresh]
  );

  const changeTransactionStatus = useCallback((id: string, status: TransactionStatus) => {
    updateTransactionStatus(id, status);
    refresh();
  }, [refresh]);

  const holdTransaction = useCallback((id: string, onHold: boolean) => {
    setTransactionHold(id, onHold);
    refresh();
  }, [refresh]);

  const resetData = useCallback(() => {
    const newState = resetToOriginalData();
    setState(newState);
    return newState;
  }, []);

  const addSamples = useCallback(() => {
    addMoreSampleTransactions();
    refresh();
  }, [refresh]);

  const setFullMember = useCallback((member: MemberProfile) => {
    const current = loadState();
    current.member = member;
    saveState(current);
    refresh();
  }, [refresh]);

  const setTransactions = useCallback((transactions: Transaction[]) => {
    const current = loadState();
    current.transactions = transactions;
    saveState(current);
    refresh();
  }, [refresh]);

  const setStocks = useCallback((stocks: StockHolding[]) => {
    const current = loadState();
    current.stocks = stocks;
    saveState(current);
    refresh();
  }, [refresh]);

  return (
    <MemberContext.Provider
      value={{
        ...state,
        hydrated,
        login,
        logout,
        updateMemberProfile,
        updatePrefs,
        createTransaction,
        buyStock,
        changeTransactionStatus,
        holdTransaction,
        resetData,
        addSamples,
        setFullMember,
        setTransactions,
        setStocks,
        refresh,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error("useMember must be used within MemberProvider");
  return ctx;
}