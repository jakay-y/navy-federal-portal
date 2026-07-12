"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .order("email", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setUsers([]);
    } else {
      setUsers(data ?? []);
    }

    setLoading(false);
  }, []);

  const updateLoginDetails = useCallback(async (id, { email, password, accessPin }) => {
    setError(null);

    const updates = {};
    if (email !== undefined) updates.email = email;
    if (password !== undefined) updates.password = password;
    if (accessPin !== undefined) updates.access_pin = accessPin;

    const { data, error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return { data: null, error: updateError };
    }

    setUsers((prev) => prev.map((user) => (user.id === id ? data : user)));

    return { data, error: null };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateLoginDetails,
  };
}