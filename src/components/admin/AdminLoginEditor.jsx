"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Save, Shield, RefreshCw, AlertCircle } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminLoginEditor({ fallbackUser, onLocalSync }) {
  const { users, loading, error, refetch, updateLoginDetails } = useUsers();
  const [selectedId, setSelectedId] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessPin, setAccessPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (users.length === 0) {
      if (fallbackUser) {
        setSelectedId(null);
        setEmail(fallbackUser.email ?? "");
        setPassword(fallbackUser.password ?? "");
        setAccessPin(fallbackUser.accessPin ?? fallbackUser.access_pin ?? "");
      }
      return;
    }

    const match =
      users.find((u) => u.email === fallbackUser?.email) ?? users[0];
    setSelectedId(match.id);
    setEmail(match.email ?? "");
    setPassword(match.password ?? "");
    setAccessPin(match.access_pin ?? "");
  }, [users, fallbackUser]);

  const handleSave = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      toast.error("Password cannot be empty.");
      return;
    }
    if (!/^\d{6}$/.test(accessPin)) {
      toast.error("Access PIN must be exactly 6 digits.");
      return;
    }

    setSaving(true);

    if (selectedId) {
      const { error: updateError } = await updateLoginDetails(selectedId, {
        email: email.trim(),
        password,
        accessPin,
      });

      if (updateError) {
        toast.error(updateError.message || "Failed to update credentials in Supabase.");
        setSaving(false);
        return;
      }
    }

    onLocalSync?.({
      email: email.trim(),
      password,
      accessPin,
    });

    toast.success("Login credentials updated.");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Supabase users unavailable</p>
            <p className="text-xs text-amber-800/80">
              {error}. Showing local credentials — save will update local session only.
            </p>
          </div>
        </div>
      )}

      {users.length > 1 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Select Member</Label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedId(id);
              const user = users.find((u) => u.id === id);
              if (user) {
                setEmail(user.email ?? "");
                setPassword(user.password ?? "");
                setAccessPin(user.access_pin ?? "");
              }
            }}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Login Email (Username)</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@email.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Member password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-8 -translate-y-1/2 px-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Access PIN (6-digit)</Label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={accessPin}
            onChange={(e) => setAccessPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="129012"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button className="gap-2 bg-navy-900 hover:bg-navy-900/90" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Update Login Credentials"}
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={refetch}>
          <RefreshCw className="h-4 w-4" />
          Refresh from Supabase
        </Button>
      </div>

      {selectedId && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Shield className="h-3.5 w-3.5" />
          Synced with Supabase user ID: {selectedId.slice(0, 8)}…
        </p>
      )}
    </div>
  );
}