"use client";

import { XCircle, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OFFICIAL_CONTACT_EMAIL } from "@/lib/config";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface DeclinedTransferModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeclinedTransferModal({
  transaction,
  open,
  onOpenChange,
}: DeclinedTransferModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            Transfer Declined
          </DialogTitle>
          <DialogDescription>
            This transfer was not approved and will not be processed. No funds have been
            deducted from your account.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5 space-y-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-slate-400">Amount</p>
            <p className="text-2xl font-bold text-navy-900">
              -{formatCurrency(transaction.amount)}
            </p>
            <p className="mt-1 text-sm font-medium text-red-600">Declined</p>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Description</span>
              <span className="text-right font-medium text-navy-900">
                {transaction.description}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Date</span>
              <span className="text-right font-medium text-navy-900">
                {formatDateTime(transaction.date)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Reference</span>
              <span className="font-mono text-xs font-medium text-navy-900">
                {transaction.referenceNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            If you believe this was declined in error or need assistance, please contact our
            member services team:
          </p>
          <a
            href={`mailto:${OFFICIAL_CONTACT_EMAIL}`}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-accent-blue hover:underline"
          >
            <Mail className="h-4 w-4" />
            {OFFICIAL_CONTACT_EMAIL}
          </a>
        </div>

        <Button className="w-full" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}