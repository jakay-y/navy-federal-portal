"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  addMoreSampleTransactions,
  addTransaction,
  clearSession,
  loadState,
  resetToOriginalData,
  saveState,
  setSession,
  updateMember,
  updateNotificationPrefs,
} from "@/lib/store";
import type {
  AppState,
  MemberProfile,
  NotificationPrefs,
  Transaction,
} from "@/lib/types";

interface MemberContextValue extends AppState {
  hydrated: boolean;
  login: () => void;
  logout: () => void;
  updateMemberProfile: (data: Partial<MemberProfile>) => void;
  updatePrefs: (prefs: Partial<NotificationPrefs>) => void;
  createTransaction: (txn: Transaction) => void;
  resetData: () => AppState;
  addSamples: () => void;
  setFullMember: (member: MemberProfile) => void;
  setTransactions: (transactions: Transaction[]) => void;
  refresh: () => void;
}

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    const loaded = loadState();
    setState(loaded);
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
  }, [refresh]);

  const login = useCallback(() => {
    const expiry = setSession();
    setState((prev) =>
      prev ? { ...prev, isAuthenticated: true, sessionExpiry: expiry } : prev
    );
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setState((prev) =>
      prev ? { ...prev, isAuthenticated: false, sessionExpiry: null } : prev
    );
  }, []);

  const updateMemberProfile = useCallback((data: Partial<MemberProfile>) => {
    const member = updateMember(data);
    setState((prev) => (prev ? { ...prev, member } : prev));
  }, []);

  const updatePrefs = useCallback((prefs: Partial<NotificationPrefs>) => {
    const notificationPrefs = updateNotificationPrefs(prefs);
    setState((prev) => (prev ? { ...prev, notificationPrefs } : prev));
  }, []);

  const createTransaction = useCallback((txn: Transaction) => {
    addTransaction(txn);
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

  if (!state) return null;

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
        resetData,
        addSamples,
        setFullMember,
        setTransactions,
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