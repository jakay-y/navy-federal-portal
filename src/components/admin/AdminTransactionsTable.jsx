"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Pencil,
  Save,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useMember } from "@/context/member-context";
import { DeclinedModal } from "@/components/DeclinedModal";
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
import { formatCurrency, formatDate, generateReferenceNumber } from "@/lib/format";
import { statusBadgeVariant, statusLabel } from "@/lib/transaction-status";

const STATUSES = ["completed", "pending", "on_hold", "failed", "declined"];
const TYPES = ["credit", "debit"];
const ACCOUNTS = ["checking", "savings"];

function getTxnField(txn, camel, snake) {
  return txn?.[camel] ?? txn?.[snake] ?? "";
}

function toLocalTxn(txn) {
  return {
    id: txn.id,
    date: getTxnField(txn, "date", "created_at") || new Date().toISOString(),
    description: getTxnField(txn, "description", "description"),
    remark: getTxnField(txn, "remark", "remark"),
    amount: Number(getTxnField(txn, "amount", "amount")) || 0,
    type: getTxnField(txn, "type", "type") || "debit",
    category: getTxnField(txn, "category", "category") || "Other",
    status: getTxnField(txn, "status", "status") || "pending",
    referenceNumber: getTxnField(txn, "referenceNumber", "reference_number"),
    accountType: getTxnField(txn, "accountType", "account_type") || "checking",
  };
}

function canReview(status) {
  return status === "pending" || status === "on_hold";
}

const emptyNewTxn = {
  description: "",
  remark: "",
  amount: "",
  type: "debit",
  category: "Other",
  status: "completed",
  accountType: "checking",
  referenceNumber: "",
  date: new Date().toISOString().slice(0, 10),
};

export function AdminTransactionsTable({ userId = null }) {
  const {
    transactions: localTransactions,
    updateTransactionDetails,
    createAdminTransaction,
    removeTransaction,
    changeTransactionStatus,
  } = useMember();

  const {
    transactions: remoteTransactions,
    error: remoteError,
    refetch,
    approveTransaction,
    declineTransaction,
    updateTransaction,
    createTransaction,
    deleteTransaction,
  } = useTransactions(userId);

  // Local member data is the source of truth (member portal + sample transactions).
  // Supabase is synced on save when available.
  const transactions = localTransactions;
  const canSyncRemote = !remoteError;

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newTxn, setNewTxn] = useState(emptyNewTxn);
  const [actionId, setActionId] = useState(null);
  const [declinedTxn, setDeclinedTxn] = useState(null);
  const [declinedModalOpen, setDeclinedModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEdit = (txn) => {
    const normalized = toLocalTxn(txn);
    setEditingId(txn.id);
    setDraft({ ...normalized });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = async () => {
    if (!editingId || !draft.description || !draft.amount) {
      toast.error("Description and amount are required.");
      return;
    }

    setSaving(true);
    const updates = {
      date: draft.date?.includes("T") ? draft.date : new Date(draft.date).toISOString(),
      description: draft.description,
      remark: draft.remark ?? "",
      amount: Number(draft.amount),
      type: draft.type,
      category: draft.category,
      status: draft.status,
      referenceNumber: draft.referenceNumber,
      accountType: draft.accountType,
    };

    updateTransactionDetails(editingId, updates);
    if (canSyncRemote) {
      const remoteMatch = remoteTransactions.find((t) => t.id === editingId);
      if (remoteMatch) {
        const { error } = await updateTransaction(editingId, updates);
        if (error) toast.error(`Saved locally. Supabase sync failed: ${error.message}`);
      }
    }

    toast.success("Transaction updated.");
    cancelEdit();
    setSaving(false);
  };

  const handleAdd = async () => {
    const amount = parseFloat(newTxn.amount);
    if (!newTxn.description || isNaN(amount) || amount <= 0) {
      toast.error("Enter a description and valid amount.");
      return;
    }

    setSaving(true);
    const txn = {
      description: newTxn.description,
      remark: newTxn.remark,
      amount,
      type: newTxn.type,
      category: newTxn.category,
      status: newTxn.status,
      referenceNumber: newTxn.referenceNumber || generateReferenceNumber(),
      accountType: newTxn.accountType,
      date: new Date(newTxn.date).toISOString(),
    };

    const id = `txn-${Date.now()}`;
    createAdminTransaction({ id, ...txn });
    if (canSyncRemote) {
      const { error } = await createTransaction({ ...txn, userId });
      if (error) toast.error(`Saved locally. Supabase sync failed: ${error.message}`);
    }

    toast.success("Transaction added.");
    setShowAdd(false);
    setNewTxn(emptyNewTxn);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setSaving(true);
    removeTransaction(id);
    if (canSyncRemote) {
      const remoteMatch = remoteTransactions.find((t) => t.id === id);
      if (remoteMatch) {
        const { error } = await deleteTransaction(id);
        if (error) toast.error(`Deleted locally. Supabase sync failed: ${error.message}`);
      }
    }
    toast.success("Transaction deleted.");
    setSaving(false);
  };

  const handleApprove = async (txn) => {
    setActionId(txn.id);
    changeTransactionStatus(txn.id, "completed");
    if (canSyncRemote) {
      const remoteMatch = remoteTransactions.find((t) => t.id === txn.id);
      if (remoteMatch) await approveTransaction(txn.id);
    }
    setActionId(null);
    toast.success("Transaction approved.");
  };

  const handleDecline = async (txn) => {
    setActionId(txn.id);
    changeTransactionStatus(txn.id, "declined");
    if (canSyncRemote) {
      const remoteMatch = remoteTransactions.find((t) => t.id === txn.id);
      if (remoteMatch) await declineTransaction(txn.id);
    }
    setActionId(null);
    setDeclinedTxn(toLocalTxn(txn));
    setDeclinedModalOpen(true);
    toast.success("Transfer declined.");
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-slate-500">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} · member portal data
              {canSyncRemote && remoteTransactions.length > 0 && " · Supabase sync enabled"}
            </p>
            {remoteError && (
              <p className="text-xs text-amber-600">Supabase sync unavailable — changes saved locally.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="gap-1 bg-navy-900 hover:bg-navy-900/90" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {showAdd && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-navy-900">New Transaction</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input type="date" value={newTxn.date} onChange={(e) => setNewTxn({ ...newTxn, date: e.target.value })} />
              <Input placeholder="Description" value={newTxn.description} onChange={(e) => setNewTxn({ ...newTxn, description: e.target.value })} />
              <Input placeholder="Remark / Memo" value={newTxn.remark} onChange={(e) => setNewTxn({ ...newTxn, remark: e.target.value })} />
              <Input type="number" step="0.01" placeholder="Amount" value={newTxn.amount} onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })} />
              <Input placeholder="Category" value={newTxn.category} onChange={(e) => setNewTxn({ ...newTxn, category: e.target.value })} />
              <Input placeholder="Reference #" value={newTxn.referenceNumber} onChange={(e) => setNewTxn({ ...newTxn, referenceNumber: e.target.value })} />
              <select value={newTxn.type} onChange={(e) => setNewTxn({ ...newTxn, type: e.target.value })} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={newTxn.status} onChange={(e) => setNewTxn({ ...newTxn, status: e.target.value })} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
              <select value={newTxn.accountType} onChange={(e) => setNewTxn({ ...newTxn, accountType: e.target.value })} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
                {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={saving}>Save Transaction</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white py-12 text-center">
            <p className="text-sm text-slate-500">No transactions yet. Add one or use &quot;Add More Sample Transactions&quot;.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="font-semibold text-navy-900">Date</TableHead>
                    <TableHead className="font-semibold text-navy-900">Description</TableHead>
                    <TableHead className="font-semibold text-navy-900">Remark</TableHead>
                    <TableHead className="font-semibold text-navy-900">Amount</TableHead>
                    <TableHead className="font-semibold text-navy-900">Type</TableHead>
                    <TableHead className="font-semibold text-navy-900">Category</TableHead>
                    <TableHead className="font-semibold text-navy-900">Account</TableHead>
                    <TableHead className="font-semibold text-navy-900">Reference</TableHead>
                    <TableHead className="font-semibold text-navy-900">Status</TableHead>
                    <TableHead className="text-right font-semibold text-navy-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => {
                    const normalized = toLocalTxn(txn);
                    const isEditing = editingId === txn.id;
                    const isBusy = actionId === txn.id || saving;

                    return (
                      <TableRow key={txn.id} className="hover:bg-slate-50/60">
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="date"
                              className="h-8 w-32 text-xs"
                              value={(draft.date ?? normalized.date).slice(0, 10)}
                              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                            />
                          ) : (
                            <span className="whitespace-nowrap text-slate-500">{formatDate(normalized.date)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input className="h-8 min-w-[120px] text-xs" value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                          ) : (
                            <span className="font-medium text-navy-900">{normalized.description}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input className="h-8 min-w-[100px] text-xs" value={draft.remark ?? ""} onChange={(e) => setDraft({ ...draft, remark: e.target.value })} />
                          ) : (
                            <span className="text-xs text-slate-500">{normalized.remark || "—"}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input type="number" step="0.01" className="h-8 w-24 text-xs" value={draft.amount ?? normalized.amount} onChange={(e) => setDraft({ ...draft, amount: parseFloat(e.target.value) })} />
                          ) : (
                            <span className={`font-semibold ${normalized.type === "credit" ? "text-emerald-600" : "text-navy-900"}`}>
                              {normalized.type === "credit" ? "+" : "-"}
                              {formatCurrency(normalized.amount)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <select value={draft.type ?? normalized.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="h-8 rounded-lg border px-2 text-xs">
                              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs capitalize">
                              {normalized.type === "credit" ? <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />}
                              {normalized.type}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input className="h-8 w-24 text-xs" value={draft.category ?? normalized.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                          ) : (
                            <Badge variant="secondary" className="text-xs">{normalized.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <select value={draft.accountType ?? normalized.accountType} onChange={(e) => setDraft({ ...draft, accountType: e.target.value })} className="h-8 rounded-lg border px-2 text-xs capitalize">
                              {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                          ) : (
                            <span className="text-xs capitalize text-slate-600">{normalized.accountType}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input className="h-8 w-28 text-xs font-mono" value={draft.referenceNumber ?? normalized.referenceNumber} onChange={(e) => setDraft({ ...draft, referenceNumber: e.target.value })} />
                          ) : (
                            <span className="font-mono text-[10px] text-slate-500">{normalized.referenceNumber || "—"}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <select value={draft.status ?? normalized.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="h-8 rounded-lg border px-2 text-xs">
                              {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                            </select>
                          ) : (
                            <Badge variant={statusBadgeVariant(normalized.status)} className="text-xs">{statusLabel(normalized.status)}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {isEditing ? (
                              <>
                                <Button size="sm" className="h-8 px-2" onClick={saveEdit} disabled={isBusy}>
                                  <Save className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={cancelEdit}>Cancel</Button>
                              </>
                            ) : (
                              <>
                                {canReview(normalized.status) && (
                                  <>
                                    <Button size="sm" className="h-8 gap-1 bg-navy-900 px-2 hover:bg-navy-900/90" disabled={isBusy} onClick={() => handleApprove(txn)}>
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button size="sm" variant="destructive" className="h-8 px-2" disabled={isBusy} onClick={() => handleDecline(txn)}>
                                      <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                )}
                                {normalized.status === "declined" && (
                                  <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => { setDeclinedTxn(normalized); setDeclinedModalOpen(true); }}>
                                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => startEdit(txn)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-red-600" disabled={isBusy} onClick={() => handleDelete(txn.id)}>
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
        )}
      </div>

      <DeclinedModal transaction={declinedTxn} open={declinedModalOpen} onOpenChange={setDeclinedModalOpen} />
    </>
  );
}