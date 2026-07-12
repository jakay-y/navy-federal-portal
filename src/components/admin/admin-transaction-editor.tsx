"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Save, Trash2, PlayCircle, PauseCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMember } from "@/context/member-context";
import { formatCurrency, formatDate, generateReferenceNumber } from "@/lib/format";
import { statusBadgeVariant, statusLabel } from "@/lib/transaction-status";
import type { Transaction, TransactionStatus, TransactionType, AccountType } from "@/lib/types";

const STATUSES: TransactionStatus[] = ["completed", "pending", "on_hold", "failed", "declined"];
const TYPES: TransactionType[] = ["credit", "debit"];

interface AdminTransactionEditorProps {
  onRequestApprove: (txn: Transaction) => void;
  onRequestDecline: (txn: Transaction) => void;
}

export function AdminTransactionEditor({
  onRequestApprove,
  onRequestDecline,
}: AdminTransactionEditorProps) {
  const {
    transactions,
    updateTransactionDetails,
    removeTransaction,
    createAdminTransaction,
    holdTransaction,
    changeTransactionStatus,
  } = useMember();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Transaction>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newTxn, setNewTxn] = useState({
    description: "",
    amount: "",
    type: "debit" as TransactionType,
    category: "Other",
    status: "completed" as TransactionStatus,
    accountType: "checking" as AccountType,
  });

  const startEdit = (txn: Transaction) => {
    setEditingId(txn.id);
    setDraft({ ...txn });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = () => {
    if (!editingId || !draft.description || !draft.amount) {
      toast.error("Description and amount are required.");
      return;
    }
    const prev = transactions.find((t) => t.id === editingId);
    if (!prev) return;

    updateTransactionDetails(editingId, {
      date: draft.date ?? prev.date,
      description: draft.description,
      amount: Number(draft.amount),
      type: (draft.type as TransactionType) ?? prev.type,
      category: draft.category ?? prev.category,
      status: (draft.status as TransactionStatus) ?? prev.status,
      accountType: (draft.accountType as AccountType) ?? prev.accountType,
    });
    toast.success("Transaction updated.");
    cancelEdit();
  };

  const handleAdd = () => {
    const amount = parseFloat(newTxn.amount);
    if (!newTxn.description || isNaN(amount) || amount <= 0) {
      toast.error("Enter a description and valid amount.");
      return;
    }
    createAdminTransaction({
      id: `txn-${Date.now()}`,
      date: new Date().toISOString(),
      description: newTxn.description,
      amount,
      type: newTxn.type,
      category: newTxn.category,
      status: newTxn.status,
      referenceNumber: generateReferenceNumber(),
      accountType: newTxn.accountType,
    });
    toast.success("Transaction added.");
    setShowAdd(false);
    setNewTxn({
      description: "",
      amount: "",
      type: "debit",
      category: "Other",
      status: "completed",
      accountType: "checking",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-navy-900">New Transaction</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Description"
              value={newTxn.description}
              onChange={(e) => setNewTxn({ ...newTxn, description: e.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={newTxn.amount}
              onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
            />
            <Input
              placeholder="Category"
              value={newTxn.category}
              onChange={(e) => setNewTxn({ ...newTxn, category: e.target.value })}
            />
            <select
              value={newTxn.type}
              onChange={(e) => setNewTxn({ ...newTxn, type: e.target.value as TransactionType })}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={newTxn.status}
              onChange={(e) => setNewTxn({ ...newTxn, status: e.target.value as TransactionStatus })}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
            <select
              value={newTxn.accountType}
              onChange={(e) => setNewTxn({ ...newTxn, accountType: e.target.value as AccountType })}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd}>Save Transaction</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => {
              const isEditing = editingId === txn.id;
              return (
                <TableRow key={txn.id}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="date"
                        className="h-8 w-32 text-xs"
                        value={draft.date?.slice(0, 10) ?? txn.date.slice(0, 10)}
                        onChange={(e) =>
                          setDraft({ ...draft, date: new Date(e.target.value).toISOString() })
                        }
                      />
                    ) : (
                      <span className="whitespace-nowrap text-slate-500">{formatDate(txn.date)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        className="h-8 min-w-[140px] text-xs"
                        value={draft.description ?? ""}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      />
                    ) : (
                      <span className="font-medium">{txn.description}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 w-24 text-xs"
                        value={draft.amount ?? txn.amount}
                        onChange={(e) => setDraft({ ...draft, amount: parseFloat(e.target.value) })}
                      />
                    ) : (
                      <span>
                        {txn.type === "credit" ? "+" : "-"}
                        {formatCurrency(txn.amount)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <select
                        value={draft.type ?? txn.type}
                        onChange={(e) => setDraft({ ...draft, type: e.target.value as TransactionType })}
                        className="h-8 rounded-lg border px-2 text-xs"
                      >
                        {TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      txn.type
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        className="h-8 w-24 text-xs"
                        value={draft.category ?? txn.category}
                        onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                      />
                    ) : (
                      txn.category
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <select
                        value={draft.status ?? txn.status}
                        onChange={(e) => setDraft({ ...draft, status: e.target.value as TransactionStatus })}
                        className="h-8 rounded-lg border px-2 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{statusLabel(s)}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant={statusBadgeVariant(txn.status)}>{statusLabel(txn.status)}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="default" className="h-8 gap-1 px-2" onClick={saveEdit}>
                            <Save className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {(txn.status === "pending" || txn.status === "on_hold") && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 gap-1 px-2"
                                title="Approve transfer"
                                onClick={() => onRequestApprove(txn)}
                              >
                                <PlayCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 gap-1 px-2"
                                title="Decline transfer"
                                onClick={() => onRequestDecline(txn)}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant={txn.status === "on_hold" ? "default" : "outline"}
                            className="h-8 px-2"
                            onClick={() => {
                              if (txn.status === "on_hold") {
                                changeTransactionStatus(txn.id, "pending");
                                toast.success("Hold released — pending admin approval.");
                              } else if (txn.status === "pending") {
                                holdTransaction(txn.id, true);
                                toast.success("Placed on hold.");
                              }
                            }}
                            disabled={txn.status !== "pending" && txn.status !== "on_hold"}
                          >
                            {txn.status === "on_hold" ? (
                              <PlayCircle className="h-3.5 w-3.5" />
                            ) : (
                              <PauseCircle className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => startEdit(txn)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-red-600"
                            onClick={() => {
                              removeTransaction(txn.id);
                              toast.success("Transaction deleted.");
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}