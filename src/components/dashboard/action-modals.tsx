"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMember } from "@/context/member-context";
import { generateReferenceNumber } from "@/lib/format";
import type { Transaction } from "@/lib/types";

const moneySchema = z.object({
  recipient: z.string().min(2, "Recipient is required"),
  amount: z.string().min(1, "Amount is required"),
  memo: z.string().optional(),
});

type MoneyForm = z.infer<typeof moneySchema>;

interface ActionModalsProps {
  activeModal: "send" | "bill" | "transfer" | null;
  onClose: () => void;
}

export function ActionModals({ activeModal, onClose }: ActionModalsProps) {
  const { member, createTransaction } = useMember();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MoneyForm>({
    resolver: zodResolver(moneySchema),
  });

  const titles = {
    send: "Send Money",
    bill: "Pay Bill",
    transfer: "Internal Transfer",
  };

  const descriptions = {
    send: "Transfer funds to another member securely.",
    bill: "Pay your bills directly from your checking account.",
    transfer: "Move funds between your Navy Federal accounts.",
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: MoneyForm) => {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }
    if (amount > member.balance) {
      toast.error("Insufficient funds for this transaction.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const descriptions: Record<string, string> = {
        send: `Zelle Payment to ${data.recipient}`,
        bill: `Bill Payment – ${data.recipient}`,
        transfer: `Internal Transfer to ${data.recipient}`,
      };

      const txn: Transaction = {
        id: `txn-${Date.now()}`,
        date: new Date().toISOString(),
        description: descriptions[activeModal!],
        amount,
        type: "debit",
        category: activeModal === "transfer" ? "Transfer" : activeModal === "bill" ? "Utilities" : "Transfer",
        status: "completed",
        referenceNumber: generateReferenceNumber(),
      };

      createTransaction(txn);
      toast.success(
        activeModal === "send"
          ? "Money sent successfully."
          : activeModal === "bill"
            ? "Bill payment processed."
            : "Transfer completed successfully."
      );
      setSubmitting(false);
      handleClose();
    }, 800);
  };

  const recipientLabels = {
    send: "Recipient Name",
    bill: "Payee / Biller",
    transfer: "Destination Account",
  };

  return (
    <Dialog open={!!activeModal} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        {activeModal && (
          <>
            <DialogHeader>
              <DialogTitle>{titles[activeModal]}</DialogTitle>
              <p className="text-sm text-slate-500">{descriptions[activeModal]}</p>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>{recipientLabels[activeModal]}</Label>
                <Input
                  placeholder={
                    activeModal === "transfer" ? "Savings ••••4821" : "Enter name"
                  }
                  {...register("recipient")}
                />
                {errors.recipient && (
                  <p className="text-xs text-red-500">{errors.recipient.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
                {errors.amount && (
                  <p className="text-xs text-red-500">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Memo (optional)</Label>
                <Input placeholder="Add a note" {...register("memo")} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Processing..." : "Confirm"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}