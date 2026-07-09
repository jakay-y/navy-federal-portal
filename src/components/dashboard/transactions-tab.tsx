"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMember } from "@/context/member-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { statusBadgeVariant, statusLabel } from "@/lib/transaction-status";

interface TransactionsTabProps {
  onViewReceipt: (id: string) => void;
}

export function TransactionsTab({ onViewReceipt }: TransactionsTabProps) {
  const { transactions } = useMember();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.description.toLowerCase().includes(search.toLowerCase()) ||
        txn.category.toLowerCase().includes(search.toLowerCase()) ||
        txn.referenceNumber.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || txn.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="credit">Credits</TabsTrigger>
              <TabsTrigger value="debit">Debits</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {formatDate(txn.date)}
                  </TableCell>
                  <TableCell className="font-medium text-navy-900">
                    {txn.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{txn.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(txn.status)}>
                      {statusLabel(txn.status)}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      txn.type === "credit" ? "text-emerald-600" : "text-navy-900"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewReceipt(txn.id)}
                      className="gap-1 text-accent-blue"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 md:hidden">
          {filtered.map((txn) => (
            <div
              key={txn.id}
              className="rounded-xl border border-slate-100 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-navy-900">{txn.description}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(txn.date)} · {txn.category}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    txn.type === "credit" ? "text-emerald-600" : "text-navy-900"
                  }`}
                >
                  {txn.type === "credit" ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-1"
                onClick={() => onViewReceipt(txn.id)}
              >
                <FileText className="h-3.5 w-3.5" />
                View Receipt
              </Button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">
            No transactions match your search.
          </p>
        )}
      </CardContent>
    </Card>
  );
}