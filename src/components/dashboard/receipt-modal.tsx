"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Shield } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { useMember } from "@/context/member-context";

interface ReceiptModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptModal({ transaction, open, onOpenChange }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { member } = useMember();

  if (!transaction) return null;

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      toast.loading("Generating PDF...");
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`NFCU-Receipt-${transaction.referenceNumber}.pdf`);
      toast.dismiss();
      toast.success("Receipt downloaded successfully.");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Receipt</DialogTitle>
        </DialogHeader>

        <motion.div
          ref={receiptRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
        >
          <div className="bg-navy-900 px-6 py-5 text-white">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <div>
                <p className="text-sm font-bold">Navy Federal Credit Union</p>
                <p className="text-xs text-white/70">Official Digital Receipt</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-slate-400">Amount</p>
              <p
                className={`text-3xl font-bold ${
                  transaction.type === "credit" ? "text-emerald-600" : "text-navy-900"
                }`}
              >
                {transaction.type === "credit" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
              <p className="mt-1 text-sm capitalize text-slate-500">{transaction.status}</p>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <ReceiptRow label="Description" value={transaction.description} />
              <ReceiptRow label="Category" value={transaction.category} />
              <ReceiptRow label="Date & Time" value={formatDateTime(transaction.date)} />
              <ReceiptRow label="Reference" value={transaction.referenceNumber} mono />
              <ReceiptRow label="Account" value={`••••${member.accountNumber.slice(-4)}`} />
              <ReceiptRow
                label="Member"
                value={`${member.firstName} ${member.lastName}`}
              />
            </div>

            <Separator />

            <p className="text-center text-xs text-slate-400">
              Thank you for banking with Navy Federal Credit Union
            </p>
          </div>
        </motion.div>

        <Button onClick={handleDownload} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className={`text-right font-medium text-slate-700 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}