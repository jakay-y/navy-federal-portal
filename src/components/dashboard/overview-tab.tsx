"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Send,
  Receipt,
  ArrowLeftRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionModals } from "@/components/dashboard/action-modals";
import { useMember } from "@/context/member-context";
import { formatCurrency, formatDate, maskAccountNumber } from "@/lib/format";

interface OverviewTabProps {
  onViewAllTransactions: () => void;
  onViewReceipt: (id: string) => void;
}

export function OverviewTab({ onViewAllTransactions, onViewReceipt }: OverviewTabProps) {
  const { member, transactions } = useMember();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeModal, setActiveModal] = useState<"send" | "bill" | "transfer" | null>(null);

  const recent = transactions.slice(0, 5);

  const quickActions = [
    { id: "send" as const, label: "Send Money", icon: Send, color: "bg-blue-50 text-accent-blue" },
    { id: "bill" as const, label: "Pay Bill", icon: Receipt, color: "bg-emerald-50 text-emerald-600" },
    { id: "transfer" as const, label: "Internal Transfer", icon: ArrowLeftRight, color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-navy-900 via-navy-800 to-accent-blue shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Available Balance</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {formatCurrency(member.balance, balanceHidden)}
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Checking • {maskAccountNumber(member.accountNumber)}
                </p>
              </div>
              <button
                onClick={() => setBalanceHidden(!balanceHidden)}
                className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
              >
                {balanceHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Member since {new Date(member.memberSince).getFullYear()}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveModal(action.id)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md sm:p-5"
          >
            <div className={`rounded-xl p-3 ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-navy-900 sm:text-sm">
              {action.label}
            </span>
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
                <button
                  onClick={() => onViewReceipt(txn.id)}
                  className="text-xs text-accent-blue hover:underline"
                >
                  Receipt
                </button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <ActionModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}