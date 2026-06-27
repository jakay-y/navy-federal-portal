"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Shield, Bell, Lock, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useMember } from "@/context/member-context";
import { formatDate } from "@/lib/format";

const settingsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email("Valid email required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(5, "ZIP is required"),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function SettingsTab() {
  const { member, notificationPrefs, updateMemberProfile, updatePrefs } = useMember();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      email: member.email,
      street: member.street,
      city: member.city,
      state: member.state,
      zip: member.zip,
    },
  });

  const onSave = (data: SettingsForm) => {
    setSaving(true);
    setTimeout(() => {
      updateMemberProfile(data);
      toast.success(
        "Your information has been updated and is now reflected across your account."
      );
      setSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your contact details. Government ID information is verified and read-only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSave)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...register("phone")} />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input {...register("street")} />
              {errors.street && (
                <p className="text-xs text-red-500">{errors.street.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input {...register("city")} />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input {...register("state")} />
                {errors.state && (
                  <p className="text-xs text-red-500">{errors.state.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input {...register("zip")} />
                {errors.zip && (
                  <p className="text-xs text-red-500">{errors.zip.message}</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-accent-blue" />
                <p className="text-sm font-semibold text-navy-900">
                  Verified from Government ID
                </p>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <ReadOnlyField label="Date of Birth" value={formatDate(member.dob)} />
                <ReadOnlyField label="ID Number" value={member.idNumber} />
                <ReadOnlyField label="Sex" value={member.sex} />
                <ReadOnlyField label="Height" value={member.height} />
                <ReadOnlyField label="Weight" value={member.weight} />
                <ReadOnlyField label="Hair / Eyes" value={`${member.hair} / ${member.eyes}`} />
                <ReadOnlyField label="ID Issue Date" value={formatDate(member.idIssueDate)} />
                <ReadOnlyField label="ID Expiry" value={formatDate(member.idExpiryDate)} />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-navy-900" />
              <CardTitle className="text-lg">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-900">Password</p>
                <p className="text-xs text-slate-400">Last changed 3 months ago</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Password change email sent to your registered address.")}
              >
                Change
              </Button>
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="h-3.5 w-3.5" />
              256-bit SSL encryption enabled
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-navy-900" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <PrefToggle
              label="Email Alerts"
              checked={notificationPrefs.emailAlerts}
              onChange={(v) => {
                updatePrefs({ emailAlerts: v });
                toast.success("Notification preferences updated.");
              }}
            />
            <PrefToggle
              label="SMS Alerts"
              checked={notificationPrefs.smsAlerts}
              onChange={(v) => {
                updatePrefs({ smsAlerts: v });
                toast.success("Notification preferences updated.");
              }}
            />
            <PrefToggle
              label="Transaction Alerts"
              checked={notificationPrefs.transactionAlerts}
              onChange={(v) => {
                updatePrefs({ transactionAlerts: v });
                toast.success("Notification preferences updated.");
              }}
            />
            <PrefToggle
              label="Marketing Emails"
              checked={notificationPrefs.marketingEmails}
              onChange={(v) => {
                updatePrefs({ marketingEmails: v });
                toast.success("Notification preferences updated.");
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-700">{value}</p>
    </div>
  );
}

function PrefToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}