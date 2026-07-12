"use client";

import { XCircle, Mail, Shield } from "lucide-react";
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

function getTxnField(txn, camel, snake) {
  return txn?.[camel] ?? txn?.[snake] ?? "";
}

export function DeclinedModal({ transaction, open, onOpenChange }) {
  if (!transaction) return null;

  const description = getTxnField(transaction, "description", "description");
  const amount = Number(getTxnField(transaction, "amount", "amount")) || 0;
  const date =
    getTxnField(transaction, "date", "created_at") ||
    getTxnField(transaction, "created_at", "created_at");
  const reference = getTxnField(transaction, "referenceNumber", "reference_number");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-slate-100 p-0 overflow-hidden">
        <div className="bg-navy-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <p className="text-sm font-bold">Navy Federal Credit Union</p>
              <p className="text-xs text-white/70">Transfer Declined</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Transfer Declined
            </DialogTitle>
            <DialogDescription>
              This transfer was not approved and will not be processed. No funds have been
              deducted from the member&apos;s account.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5 space-y-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-slate-400">Amount</p>
              <p className="text-2xl font-bold text-navy-900">-{formatCurrency(amount)}</p>
              <p className="mt-1 text-sm font-medium text-red-600">Declined</p>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Description</span>
                <span className="text-right font-medium text-navy-900">{description}</span>
              </div>
              {date && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Date</span>
                  <span className="text-right font-medium text-navy-900">
                    {formatDateTime(date)}
                  </span>
                </div>
              )}
              {reference && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-mono text-xs font-medium text-navy-900">
                    {reference}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              The member will be directed to contact our official support team for assistance:
            </p>
            <a
              href={`mailto:${OFFICIAL_CONTACT_EMAIL}`}
              className="mt-3 flex items-center gap-2 text-sm font-semibold text-accent-blue hover:underline"
            >
              <Mail className="h-4 w-4" />
              {OFFICIAL_CONTACT_EMAIL}
            </a>
          </div>

          <Button className="w-full bg-navy-900 hover:bg-navy-900/90" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}