"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Link2,
  RefreshCw,
  Save,
  Shield,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ProfileAvatar } from "@/components/brand/profile-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AdminTransactionsTable } from "@/components/admin/AdminTransactionsTable";
import { AdminLoginEditor } from "@/components/admin/AdminLoginEditor";
import { useMember } from "@/context/member-context";
import { ADMIN_PASSWORD, getTotalBalance } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { getShareableLink, APP_URL } from "@/lib/config";
import type { MemberProfile } from "@/lib/types";

export default function AdminPage() {
  const {
    member,
    setFullMember,
    resetData,
    addSamples,
  } = useMember();
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [revealCreds, setRevealCreds] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(member.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm<MemberProfile>({
    defaultValues: member,
  });

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setAuthenticated(true);
      reset(member);
      setAvatarPreview(member.avatarUrl);
      setShareUrl(
        process.env.NEXT_PUBLIC_APP_URL ||
          (typeof window !== "undefined" ? window.location.origin : APP_URL)
      );
      toast.success("Admin access granted.");
    } else {
      toast.error("Invalid admin password.");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      setFullMember({ ...member, avatarUrl: dataUrl });
      toast.success("Profile photo updated. Member portal synced.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removePhoto = () => {
    setAvatarPreview("");
    setFullMember({ ...member, avatarUrl: "" });
    toast.info("Profile photo removed.");
  };

  const onUpdateMember = (data: MemberProfile) => {
    setFullMember({
      ...data,
      checkingBalance: Number(data.checkingBalance),
      savingsBalance: Number(data.savingsBalance),
      creditScore: Number(data.creditScore),
      avatarUrl: avatarPreview,
    });
    toast.success("Member profile updated successfully.");
  };

  const syncLoginToLocal = (creds: { email: string; password: string; accessPin: string }) => {
    const updated = {
      ...member,
      email: creds.email,
      password: creds.password,
      accessPin: creds.accessPin,
    };
    setFullMember(updated);
    reset(updated);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard.`);
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md rounded-3xl">
          <CardHeader className="text-center">
            <Logo className="mx-auto mb-2" />
            <CardTitle>Administrator Access</CardTitle>
            <CardDescription>
              Enter the admin password to manage member data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Password</Label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full">
              Access Admin Portal
            </Button>
            <Link href="/" className="flex items-center justify-center gap-1 text-sm text-slate-400 hover:text-navy-900">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to portal
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="h-4 w-4" />
            Admin Portal
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <ProfileAvatar
              firstName={member.firstName}
              lastName={member.lastName}
              avatarUrl={avatarPreview}
              size="lg"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-navy-900">
                {member.firstName} {member.lastName}
              </h2>
              <p className="text-sm text-slate-500">{member.email}</p>
              <p className="mt-1 text-lg font-semibold text-emerald-600">
                {formatCurrency(getTotalBalance(member))}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
              {avatarPreview && (
                <Button variant="ghost" size="sm" className="gap-2 text-red-600" onClick={removePhoto}>
                  <Trash2 className="h-4 w-4" />
                  Remove Photo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-navy-900/10 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-navy-900" />
              Login &amp; Access Credentials
            </CardTitle>
            <CardDescription>
              Update the member&apos;s sign-in email, password, and secure access PIN. Changes take
              effect immediately for the next login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminLoginEditor
              fallbackUser={{
                email: member.email,
                password: member.password,
                accessPin: member.accessPin,
              }}
              onLocalSync={syncLoginToLocal}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Edit Member Profile</CardTitle>
            <CardDescription>Profile photo can only be updated here — not in the member portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onUpdateMember)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First Name" name="firstName" register={register} />
                <Field label="Last Name" name="lastName" register={register} />
                <Field label="Phone" name="phone" register={register} />
                <Field label="Checking Balance" name="checkingBalance" register={register} type="number" step="0.01" />
                <Field label="Savings Balance" name="savingsBalance" register={register} type="number" step="0.01" />
                <Field label="Credit Score" name="creditScore" register={register} type="number" />
                <Field label="Account Number" name="accountNumber" register={register} />
                <Field label="Savings Account #" name="savingsAccountNumber" register={register} />
                <Field label="Routing Number" name="routingNumber" register={register} />
                <Field label="Street" name="street" register={register} />
                <Field label="City" name="city" register={register} />
                <Field label="State" name="state" register={register} />
                <Field label="ZIP" name="zip" register={register} />
                <Field label="DOB" name="dob" register={register} />
                <Field label="ID Number" name="idNumber" register={register} />
                <Field label="Sex" name="sex" register={register} />
                <Field label="Height" name="height" register={register} />
                <Field label="Weight" name="weight" register={register} />
                <Field label="Hair" name="hair" register={register} />
                <Field label="Eyes" name="eyes" register={register} />
                <Field label="ID Issue Date" name="idIssueDate" register={register} />
                <Field label="ID Expiry" name="idExpiryDate" register={register} />
                <Field label="Member Since" name="memberSince" register={register} />
              </div>

              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Update Member
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Transaction Manager</CardTitle>
            <CardDescription>
              View, add, and edit all transaction details — date, description, remark, amount,
              type, category, account, reference, and status. Approve or decline pending transfers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminTransactionsTable />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-accent-blue/20 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-accent-blue" />
              Share Access Link
            </CardTitle>
            <CardDescription>
              Send this link to the member. They will complete PIN verification before accessing the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Login Email</p>
                  <p className="font-medium text-navy-900">{member.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(member.email, "Email")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Password</p>
                  <p className="font-mono font-medium text-navy-900">
                    {revealCreds ? member.password : "••••••••••••••"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setRevealCreds(!revealCreds)}>
                    {revealCreds ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(member.password, "Password")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Access PIN</p>
                  <p className="font-mono font-medium text-navy-900">{member.accessPin}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(member.accessPin, "Access PIN")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => copyToClipboard(shareUrl || getShareableLink(), "Shareable link")}
            >
              <Copy className="h-4 w-4" />
              Copy Shareable Link
            </Button>
            <p className="text-center text-xs text-slate-400">{shareUrl}</p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const newState = resetData();
              reset(newState.member);
              setAvatarPreview("");
              toast.success("Member data reset to original ID data.");
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Original ID Data
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              addSamples();
              toast.success("Additional sample transactions added.");
            }}
          >
            <Plus className="h-4 w-4" />
            Add More Sample Transactions
          </Button>
        </div>

        <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-navy-900">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to portal
        </Link>
      </main>

    </div>
  );
}

function Field({
  label,
  name,
  register,
  type = "text",
  step,
}: {
  label: string;
  name: keyof MemberProfile;
  register: ReturnType<typeof useForm<MemberProfile>>["register"];
  type?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type={type} step={step} {...register(name)} />
    </div>
  );
}