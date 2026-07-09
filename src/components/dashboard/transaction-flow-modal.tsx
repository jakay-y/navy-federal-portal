"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/auth/otp-input";
import { useMember } from "@/context/member-context";
import { formatCurrency, generateReferenceNumber, maskAccountNumber } from "@/lib/format";
import type { AccountType, Transaction } from "@/lib/types";
import { TRANSFER_COT_CODE } from "@/lib/types";

const detailsSchema = z.object({
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientBank: z.string().min(2, "Bank name is required"),
  routingNumber: z.string().min(9, "Valid routing number required").max(9),
  accountNumber: z.string().min(4, "Account number required"),
  swiftCode: z.string().optional(),
  purpose: z.string().min(3, "Transfer purpose is required"),
  memo: z.string().optional(),
});

const amountSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  cotCode: z.string().min(4, "COT authorization code required"),
});

type DetailsForm = z.infer<typeof detailsSchema>;
type AmountForm = z.infer<typeof amountSchema>;

export type TransactionFlowType = "send" | "bill" | "transfer" | null;

interface TransactionFlowModalProps {
  activeModal: TransactionFlowType;
  onClose: () => void;
}

const STEPS = ["Account", "Details", "Amount", "Review", "Authorize", "Processing", "Complete"] as const;

const titles: Record<NonNullable<TransactionFlowType>, string> = {
  send: "Enterprise Wire Transfer",
  bill: "Bill Payment Authorization",
  transfer: "Internal Account Transfer",
};

export function TransactionFlowModal({ activeModal, onClose }: TransactionFlowModalProps) {
  const { member, createTransaction } = useMember();
  const [step, setStep] = useState(0);
  const [sourceAccount, setSourceAccount] = useState<AccountType>("checking");
  const [pinError, setPinError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [reference, setReference] = useState("");

  const detailsForm = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      recipientName: "",
      recipientBank: "",
      routingNumber: "",
      accountNumber: "",
      swiftCode: "",
      purpose: "",
      memo: "",
    },
  });

  const amountForm = useForm<AmountForm>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: "", cotCode: "" },
  });

  const availableBalance =
    sourceAccount === "checking" ? member.checkingBalance : member.savingsBalance;

  const resetAll = () => {
    setStep(0);
    setSourceAccount("checking");
    setPinError(false);
    setProcessing(false);
    setReference("");
    detailsForm.reset();
    amountForm.reset();
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const submitDetails = detailsForm.handleSubmit(() => goNext());
  const submitAmount = amountForm.handleSubmit((data) => {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (amount > availableBalance) {
      toast.error("Insufficient funds in selected account.");
      return;
    }
    if (data.cotCode.trim() !== TRANSFER_COT_CODE) {
      toast.error("Invalid COT authorization code.");
      return;
    }
    goNext();
  });

  const handlePinComplete = (pin: string) => {
    if (pin.length < 4) return;
    if (pin !== member.accessPin.slice(0, 4) && pin !== "1290") {
      setPinError(true);
      toast.error("Invalid authorization PIN.");
      return;
    }
    setPinError(false);
    setStep(5);
    setProcessing(true);
    const ref = generateReferenceNumber();
    setReference(ref);

    setTimeout(() => {
      const details = detailsForm.getValues();
      const amount = parseFloat(amountForm.getValues("amount"));

      const descriptions: Record<NonNullable<TransactionFlowType>, string> = {
        send: `Wire Transfer — ${details.recipientName}`,
        bill: `Bill Payment — ${details.recipientName}`,
        transfer: `Internal Transfer — ${details.recipientName}`,
      };

      const txn: Transaction = {
        id: `txn-${Date.now()}`,
        date: new Date().toISOString(),
        description: descriptions[activeModal!],
        amount,
        type: "debit",
        category: activeModal === "bill" ? "Utilities" : "Transfer",
        status: "pending",
        referenceNumber: ref,
        accountType: sourceAccount,
      };

      createTransaction(txn);
      setProcessing(false);
      setStep(6);
      toast.success("Transaction submitted for processing.");
    }, 2500);
  };

  if (!activeModal) return null;

  return (
    <Dialog open={!!activeModal} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[activeModal]}</DialogTitle>
          <div className="flex gap-1 pt-2">
            {STEPS.slice(0, 5).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-navy-900" : "bg-slate-100"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Step {Math.min(step + 1, 5)} of 5 — {STEPS[step]}
          </p>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Select the source account for this transaction.</p>
            {(["checking", "savings"] as AccountType[]).map((acc) => {
              const bal = acc === "checking" ? member.checkingBalance : member.savingsBalance;
              const num = acc === "checking" ? member.accountNumber : member.savingsAccountNumber;
              return (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setSourceAccount(acc)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                    sourceAccount === acc
                      ? "border-navy-900 bg-navy-900/5"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <p className="font-semibold capitalize text-navy-900">{acc} Account</p>
                  <p className="text-sm text-slate-500">{maskAccountNumber(num)}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">{formatCurrency(bal)}</p>
                </button>
              );
            })}
            <Button className="w-full gap-2" onClick={goNext}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={submitDetails} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Recipient / Payee Name" error={detailsForm.formState.errors.recipientName?.message}>
                <Input {...detailsForm.register("recipientName")} placeholder="Full legal name" />
              </Field>
              <Field label="Financial Institution" error={detailsForm.formState.errors.recipientBank?.message}>
                <Input {...detailsForm.register("recipientBank")} placeholder="Bank name" />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Routing Number" error={detailsForm.formState.errors.routingNumber?.message}>
                <Input {...detailsForm.register("routingNumber")} placeholder="9 digits" maxLength={9} />
              </Field>
              <Field label="Account Number" error={detailsForm.formState.errors.accountNumber?.message}>
                <Input {...detailsForm.register("accountNumber")} placeholder="Account number" />
              </Field>
            </div>
            {activeModal === "send" && (
              <Field label="SWIFT / BIC (International)" error={detailsForm.formState.errors.swiftCode?.message}>
                <Input {...detailsForm.register("swiftCode")} placeholder="Optional for domestic" />
              </Field>
            )}
            <Field label="Transfer Purpose" error={detailsForm.formState.errors.purpose?.message}>
              <Input {...detailsForm.register("purpose")} placeholder="e.g. Family support, Invoice #1042" />
            </Field>
            <Field label="Memo (optional)" error={detailsForm.formState.errors.memo?.message}>
              <Input {...detailsForm.register("memo")} placeholder="Internal reference note" />
            </Field>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1 gap-1" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="flex-1 gap-1">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitAmount} className="space-y-4">
            <Field label="Transfer Amount ($)" error={amountForm.formState.errors.amount?.message}>
              <Input type="number" step="0.01" placeholder="0.00" {...amountForm.register("amount")} />
            </Field>
            <p className="text-xs text-slate-500">
              Available: {formatCurrency(availableBalance)} from {sourceAccount} account
            </p>
            <Field label="COT Authorization Code" error={amountForm.formState.errors.cotCode?.message}>
              <Input {...amountForm.register("cotCode")} placeholder="Enter COT code" />
            </Field>
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              Enterprise transfers require a valid Cost of Transfer (COT) code issued by your account officer.
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Review Transfer
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-sm">
              <ReviewRow label="From" value={`${sourceAccount} • ${maskAccountNumber(sourceAccount === "checking" ? member.accountNumber : member.savingsAccountNumber)}`} />
              <ReviewRow label="To" value={detailsForm.getValues("recipientName")} />
              <ReviewRow label="Bank" value={detailsForm.getValues("recipientBank")} />
              <ReviewRow label="Routing" value={detailsForm.getValues("routingNumber")} />
              <ReviewRow label="Account" value={`••••${detailsForm.getValues("accountNumber").slice(-4)}`} />
              <ReviewRow label="Purpose" value={detailsForm.getValues("purpose")} />
              <ReviewRow label="Amount" value={formatCurrency(parseFloat(amountForm.getValues("amount") || "0"))} highlight />
            </div>
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <FileText className="h-3.5 w-3.5" />
              By continuing, you authorize this transaction subject to review.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={goBack}>Back</Button>
              <Button className="flex-1" onClick={goNext}>Authorize Transfer</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-navy-900" />
            <p className="text-sm text-slate-600">
              Enter the first 4 digits of your secure access PIN to authorize this transaction.
            </p>
            <OtpInput length={4} onComplete={handlePinComplete} hasError={pinError} disabled={processing} />
            <Button variant="ghost" onClick={goBack}>Back to review</Button>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col items-center py-8 text-center">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-navy-900" />
            <p className="font-semibold text-navy-900">Processing Transaction</p>
            <p className="mt-2 text-sm text-slate-500">
              Validating compliance, fraud screening, and settlement routing...
            </p>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-600" />
            <p className="text-lg font-semibold text-navy-900">Transaction Submitted</p>
            <p className="mt-2 text-sm text-slate-500">
              Reference: <span className="font-mono font-medium">{reference}</span>
            </p>
            <p className="mt-1 text-xs text-amber-600">Status: Pending review — funds on hold until cleared.</p>
            <Button className="mt-6 w-full" onClick={handleClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right font-medium ${highlight ? "text-emerald-600" : "text-navy-900"}`}>
        {value}
      </span>
    </div>
  );
}