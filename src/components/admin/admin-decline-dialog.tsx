"use client";

import { useState } from "react";
import { XCircle, AlertCircle, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OFFICIAL_CONTACT_EMAIL } from "@/lib/config";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface AdminDeclineDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeclined: (txnId: string) => void;
}

export function AdminDeclineDialog({
  transaction,
  open,
  onOpenChange,
  onDeclined,
}: AdminDeclineDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleClose = (v: boolean) => {
    if (!v) setSubmitting(false);
    onOpenChange(v);
  };

  const handleDecline = () => {
    if (!transaction) return;
    setSubmitting(true);
    setTimeout(() => {
      onDeclined(transaction.id);
      setSubmitting(false);
      onOpenChange(false);
    }, 300);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Decline Transfer
          </DialogTitle>
          <DialogDescription>
            This transfer will not be processed. The member will be notified and directed to
            contact support.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction</span>
            <span className="font-medium text-navy-900 text-right max-w-[60%] truncate">
              {transaction.description}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount</span>
            <span className="font-semibold text-navy-900">
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 text-sm">
          <p className="flex items-start gap-2 text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              The member will see the official contact email when viewing this declined
              transfer:
            </span>
          </p>
          <p className="mt-2 flex items-center gap-2 font-medium text-navy-900">
            <Mail className="h-4 w-4 text-accent-blue" />
            {OFFICIAL_CONTACT_EMAIL}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDecline}
            disabled={submitting}
          >
            {submitting ? "Declining..." : "Decline Transfer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}