"use client";

import { useState } from "react";
import Image from "next/image";
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
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMember } from "@/context/member-context";
import { ADMIN_PASSWORD } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { getShareableLink, APP_URL } from "@/lib/config";
import type { MemberProfile } from "@/lib/types";

export default function AdminPage() {
  const { member, setFullMember, resetData, addSamples } = useMember();
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [revealCreds, setRevealCreds] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const { register, handleSubmit, reset } = useForm<MemberProfile>({
    defaultValues: member,
  });

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setAuthenticated(true);
      reset(member);
      setShareUrl(
        process.env.NEXT_PUBLIC_APP_URL ||
          (typeof window !== "undefined" ? window.location.origin : APP_URL)
      );
      toast.success("Admin access granted.");
    } else {
      toast.error("Invalid admin password.");
    }
  };

  const onUpdateMember = (data: MemberProfile) => {
    setFullMember({
      ...data,
      balance: Number(data.balance),
      avatarUrl: member.avatarUrl,
    });
    toast.success("Member profile updated successfully.");
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
              <p className="text-xs text-slate-400">
                Demo password: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">{ADMIN_PASSWORD}</code>
              </p>
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
          <CardContent className="flex items-center gap-5 p-6">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-slate-100">
              <Image
                src={member.avatarUrl}
                alt={`${member.firstName} ${member.lastName}`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900">
                {member.firstName} {member.lastName}
              </h2>
              <p className="text-sm text-slate-500">{member.email}</p>
              <p className="mt-1 text-lg font-semibold text-emerald-600">
                {formatCurrency(member.balance)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Edit Member Profile</CardTitle>
            <CardDescription>All fields are editable and save instantly to localStorage.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onUpdateMember)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First Name" name="firstName" register={register} />
                <Field label="Last Name" name="lastName" register={register} />
                <Field label="Email" name="email" register={register} />
                <Field label="Password" name="password" register={register} />
                <Field label="Phone" name="phone" register={register} />
                <Field label="Balance" name="balance" register={register} type="number" step="0.01" />
                <Field label="Account Number" name="accountNumber" register={register} />
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

        <Card className="rounded-2xl border-accent-blue/20 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-accent-blue" />
              Share Access Link
            </CardTitle>
            <CardDescription>
              Send this link to Ciro Ballard. He will experience the full authentication flow
              and land in his personalized dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Login Email</p>
                  <p className="font-medium text-navy-900">{member.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(member.email, "Email")}
                >
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevealCreds(!revealCreds)}
                  >
                    {revealCreds ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(member.password, "Password")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
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