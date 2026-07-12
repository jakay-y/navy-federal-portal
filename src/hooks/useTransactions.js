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
  };
}