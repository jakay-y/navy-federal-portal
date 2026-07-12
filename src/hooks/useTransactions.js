"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useTransactions(userId = null) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setTransactions([]);
    } else {
      setTransactions(data ?? []);
    }

    setLoading(false);
  }, [userId]);

  const updateStatus = useCallback(
    async (id, status) => {
      setError(null);

      const { data, error: updateError } = await supabase
        .from("transactions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        return { data: null, error: updateError };
      }

      setTransactions((prev) =>
        prev.map((txn) => (txn.id === id ? data : txn))
      );

      return { data, error: null };
    },
    []
  );

  const approveTransaction = useCallback(
    (id) => updateStatus(id, "completed"),
    [updateStatus]
  );

  const declineTransaction = useCallback(
    (id) => updateStatus(id, "declined"),
    [updateStatus]
  );

  const updateTransaction = useCallback(async (id, updates) => {
    setError(null);

    const payload = {};
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.remark !== undefined) payload.remark = updates.remark;
    if (updates.amount !== undefined) payload.amount = Number(updates.amount);
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.accountType !== undefined) payload.account_type = updates.accountType;
    if (updates.referenceNumber !== undefined) payload.reference_number = updates.referenceNumber;
    if (updates.date !== undefined) payload.created_at = updates.date;

    const { data, error: updateError } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return { data: null, error: updateError };
    }

    setTransactions((prev) => prev.map((txn) => (txn.id === id ? data : txn)));
    return { data, error: null };
  }, []);

  const createTransaction = useCallback(async (txn) => {
    setError(null);

    const payload = {
      description: txn.description,
      remark: txn.remark ?? "",
      amount: Number(txn.amount),
      type: txn.type,
      category: txn.category,
      status: txn.status ?? "pending",
      account_type: txn.accountType ?? "checking",
      reference_number: txn.referenceNumber,
      created_at: txn.date ?? new Date().toISOString(),
    };
    if (txn.userId) payload.user_id = txn.userId;

    const { data, error: createError } = await supabase
      .from("transactions")
      .insert(payload)
      .select()
      .single();

    if (createError) {
      setError(createError.message);
      return { data: null, error: createError };
    }

    setTransactions((prev) => [data, ...prev]);
    return { data, error: null };
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    setError(null);

    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return { error: deleteError };
    }

    setTransactions((prev) => prev.filter((txn) => txn.id !== id));
    return { error: null };
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    approveTransaction,
    declineTransaction,
    updateTransaction,
    createTransaction,
    deleteTransaction,
  };
}