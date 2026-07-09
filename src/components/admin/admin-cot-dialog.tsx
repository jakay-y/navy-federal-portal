"use client";

import { useState } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRANSFER_COT_CODE } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface AdminCotDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: (txnId: string) => void;
}

export function AdminCotDialog({
  transaction,
  open,
  onOpenChange,
  onApproved,
}: AdminCotDialogProps) {
  const [cotInput, setCotInput] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = (v: boolean) => {
    if (!v) {
      setCotInput("");
      setError(false);
    }
    onOpenChange(v);
  };

  const handleApprove = () => {
    if (cotInput.trim() !== TRANSFER_COT_CODE) {
      setError(true);
      return;
    }
    if (!transaction) return;

    setSubmitting(true);
    setTimeout(() => {
      onApproved(transaction.id);
      setSubmitting(false);
      setCotInput("");
      setError(false);
      onOpenChange(false);
    }, 400);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-navy-900" />
            COT Verification Required
          </DialogTitle>
          <DialogDescription>
            Enter the permanent Cost of Transfer (COT) code to approve and finalize this
            transfer.
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

        <div className="space-y-2">
          <Label htmlFor="admin-cot">COT Authorization Code</Label>
          <Input
            id="admin-cot"
            value={cotInput}
            onChange={(e) => {
              setCotInput(e.target.value);
              setError(false);
            }}
            placeholder="Enter COT code"
            className={error ? "border-red-400 focus-visible:ring-red-400" : ""}
            autoComplete="off"
            onKeyDown={(e) => e.key === "Enter" && handleApprove()}
          />
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Invalid COT code. Please enter the correct authorization code.
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleApprove} disabled={submitting || !cotInput}>
            {submitting ? "Approving..." : "Approve Transfer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}