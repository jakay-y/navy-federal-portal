"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMember } from "@/context/member-context";

interface CashAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CashAppModal({ open, onOpenChange }: CashAppModalProps) {
  const { member, updateMemberProfile } = useMember();
  const [tag, setTag] = useState(member.cashAppTag || "");
  const [step, setStep] = useState<"form" | "processing" | "done">("form");

  const handleConnect = () => {
    if (!tag.trim()) {
      toast.error("Enter your Cash App $Cashtag.");
      return;
    }
    setStep("processing");
    setTimeout(() => {
      updateMemberProfile({
        cashAppConnected: true,
        cashAppTag: tag.startsWith("$") ? tag : `$${tag}`,
      });
      setStep("done");
      toast.success("Cash App connected successfully.");
    }, 1800);
  };

  const handleDisconnect = () => {
    updateMemberProfile({ cashAppConnected: false, cashAppTag: "" });
    setTag("");
    toast.info("Cash App disconnected.");
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) setTimeout(() => setStep("form"), 300);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-600" />
            Connect Cash App
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Link your Cash App account for instant transfers between NFCU and Cash App.
          </p>
        </DialogHeader>

        {member.cashAppConnected && step === "form" ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-5 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-600" />
              <p className="font-semibold text-navy-900">Connected</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">{member.cashAppTag}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : step === "form" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cash App $Cashtag</Label>
              <Input
                placeholder="$YourCashtag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              Transfers are subject to Cash App terms. NFCU does not charge a connection fee.
            </div>
            <Button className="w-full" onClick={handleConnect}>
              Connect Account
            </Button>
          </div>
        ) : step === "processing" ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-navy-900" />
            <p className="font-medium text-navy-900">Verifying Cash App account...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-600" />
            <p className="font-semibold text-navy-900">Cash App Linked</p>
            <p className="mt-2 text-sm text-slate-500">
              You can now transfer between NFCU and {member.cashAppTag}.
            </p>
            <Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}