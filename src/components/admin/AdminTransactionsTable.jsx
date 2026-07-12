"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { DeclinedModal } from "@/components/DeclinedModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { statusBadgeVariant, statusLabel } from "@/lib/transaction-status";

function getTxnField(txn, camel, snake) {
  return txn?.[camel] ?? txn?.[snake] ?? "";
}

function canReview(status) {
  return status === "pending" || status === "on_hold";
}

export function AdminTransactionsTable({ userId = null }) {
  const {
    transactions,
    loading,
    error,
    refetch,
    approveTransaction,
    declineTransaction,
  } = useTransactions(userId);

  const [actionId, setActionId] = useState(null);
  const [declinedTxn, setDeclinedTxn] = useState(null);
  const [declinedModalOpen, setDeclinedModalOpen] = useState(false);

  const handleApprove = async (txn) => {
    setActionId(txn.id);
    const { error: approveError } = await approveTransaction(txn.id);
    setActionId(null);

    if (approveError) {
      toast.error(approveError.message || "Failed to approve transaction.");
      return;
    }

    toast.success("Transaction approved and posted.");
  };

  const handleDecline = async (txn) => {
    setActionId(txn.id);
    const { data, error: declineError } = await declineTransaction(txn.id);
    setActionId(null);

    if (declineError) {
      toast.error(declineError.message || "Failed to decline transaction.");
      return;
    }

    setDeclinedTxn(data ?? txn);
    setDeclinedModalOpen(true);
    toast.success("Transfer declined.");
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <p className="font-medium text-navy-900">Unable to load transactions</p>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={refetch}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white py-12 text-center">
        <p className="text-sm text-slate-500">No transactions found.</p>
        <Button variant="ghost" size="sm" className="mt-2 gap-2" onClick={refetch}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
          <Button variant="outline" size="sm" className="gap-2" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="font-semibold text-navy-900">Date</TableHead>
                  <TableHead className="font-semibold text-navy-900">Description</TableHead>
                  <TableHead className="font-semibold text-navy-900">Category</TableHead>
                  <TableHead className="font-semibold text-navy-900">Type</TableHead>
                  <TableHead className="font-semibold text-navy-900">Status</TableHead>
                  <TableHead className="text-right font-semibold text-navy-900">Amount</TableHead>
                  <TableHead className="text-right font-semibold text-navy-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => {
                  const status = getTxnField(txn, "status", "status") || "pending";
                  const type = getTxnField(txn, "type", "type") || "debit";
                  const amount = Number(getTxnField(txn, "amount", "amount")) || 0;
                  const date =
                    getTxnField(txn, "date", "created_at") ||
                    getTxnField(txn, "created_at", "created_at");
                  const isBusy = actionId === txn.id;

                  return (
                    <TableRow key={txn.id} className="hover:bg-slate-50/60">
                      <TableCell className="whitespace-nowrap text-slate-500">
                        {date ? formatDate(date) : "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium text-navy-900">
                        {getTxnField(txn, "description", "description")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {getTxnField(txn, "category", "category") || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs capitalize text-slate-600">
                          {type === "credit" ? (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
                          )}
                          {type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(status)} className="text-xs">
                          {statusLabel(status)}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          type === "credit" ? "text-emerald-600" : "text-navy-900"
                        }`}
                      >
                        {type === "credit" ? "+" : "-"}
                        {formatCurrency(amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {canReview(status) ? (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="h-8 gap-1 bg-navy-900 px-2.5 hover:bg-navy-900/90"
                              disabled={isBusy}
                              onClick={() => handleApprove(txn)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 gap-1 px-2.5"
                              disabled={isBusy}
                              onClick={() => handleDecline(txn)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Decline
                            </Button>
                          </div>
                        ) : status === "declined" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 px-2.5"
                            onClick={() => {
                              setDeclinedTxn(txn);
                              setDeclinedModalOpen(true);
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                            View
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <DeclinedModal
        transaction={declinedTxn}
        open={declinedModalOpen}
        onOpenChange={setDeclinedModalOpen}
      />
    </>
  );
}