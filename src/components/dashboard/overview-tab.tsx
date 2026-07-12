"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Receipt,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Home,
  Smartphone,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccountCards } from "@/components/dashboard/account-cards";
import { CreditScoreCard } from "@/components/dashboard/credit-score-card";
import { TransactionFlowModal, type TransactionFlowType } from "@/components/dashboard/transaction-flow-modal";
import { HelocModal } from "@/components/dashboard/heloc-modal";
import { CashAppModal } from "@/components/dashboard/cash-app-modal";
import { useMember } from "@/context/member-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { statusBadgeVariant, statusLabel } from "@/lib/transaction-status";
import { Badge } from "@/components/ui/badge";

interface OverviewTabProps {
  onViewAllTransactions: () => void;
  onViewReceipt: (id: string) => void;
  onViewInvestments: () => void;
}

export function OverviewTab({
  onViewAllTransactions,
  onViewReceipt,
  onViewInvestments,
}: OverviewTabProps) {
  const { member, transactions } = useMember();
  const [activeModal, setActiveModal] = useState<TransactionFlowType>(null);
  const [helocOpen, setHelocOpen] = useState(false);
  const [cashAppOpen, setCashAppOpen] = useState(false);

  const recent = transactions.slice(0, 5);

  const quickActions = [
    { id: "send" as const, label: "Send Money", icon: Send, color: "bg-blue-50 text-accent-blue" },
    { id: "bill" as const, label: "Pay Bill", icon: Receipt, color: "bg-emerald-50 text-emerald-600" },
    { id: "transfer" as const, label: "Transfer", icon: ArrowLeftRight, color: "bg-violet-50 text-violet-600" },
  ];

  const featureCards = [
    { label: "Apply for HELOC", icon: Home, color: "bg-navy-900/5 text-navy-900", onClick: () => setHelocOpen(true) },
    { label: "Connect Cash App", icon: Smartphone, color: "bg-emerald-50 text-emerald-600", onClick: () => setCashAppOpen(true) },
    { label: "Investments", icon: BarChart3, color: "bg-blue-50 text-accent-blue", onClick: onViewInvestments },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
      >
        <h1 className="text-2xl font-bold text-navy-900">
          {greeting}, {member.firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s an overview of your accounts and activity.
        </p>
      </motion.div>

      <AccountCards />
      <CreditScoreCard />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setActiveModal(action.id)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md sm:p-5"
          >
            <div className={`rounded-xl p-3 ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-navy-900 sm:text-sm">{action.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {featureCards.map((feat, i) => (
          <motion.button
            key={feat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            onClick={feat.onClick}
            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md"
          >
            <div className={`rounded-xl p-3 ${feat.color}`}>
              <feat.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-navy-900">{feat.label}</span>
          </motion.button>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAllTransactions}>
            View all
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          {recent.map((txn, i) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    txn.type === "credit" ? "bg-emerald-50" : "bg-slate-100"
                  }`}
                >
                  {txn.type === "credit" ? (
                    <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-900">{txn.description}</p>
                  <p className="text-xs text-slate-400">
                    {formatDate(txn.date)} · {txn.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    txn.type === "credit" ? "text-emerald-600" : "text-navy-900"
                  }`}
                >
                  {txn.type === "credit" ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </p>
                <div className="mt-1 flex items-center justify-end gap-2">
                  <Badge variant={statusBadgeVariant(txn.status)} className="text-[10px]">
                    {statusLabel(txn.status)}
                  </Badge>
                  <button
                    onClick={() => onViewReceipt(txn.id)}
                    className="text-xs text-accent-blue hover:underline"
                  >
                    {txn.status === "declined" ? "Details" : "Receipt"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <TransactionFlowModal activeModal={activeModal} onClose={() => setActiveModal(null)} />
      <HelocModal open={helocOpen} onOpenChange={setHelocOpen} />
      <CashAppModal open={cashAppOpen} onOpenChange={setCashAppOpen} />
    </div>
  );
}