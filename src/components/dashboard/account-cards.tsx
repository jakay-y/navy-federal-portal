"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, PiggyBank, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMember } from "@/context/member-context";
import { formatCurrency, maskAccountNumber } from "@/lib/format";
import { getTotalBalance } from "@/lib/types";

export function AccountCards() {
  const { member } = useMember();
  const [hidden, setHidden] = useState(false);
  const total = getTotalBalance(member);

  const accounts = [
    {
      id: "checking",
      label: "Everyday Checking",
      sublabel: "Free Active Duty Checking",
      balance: member.checkingBalance,
      account: member.accountNumber,
      icon: Wallet,
      gradient: "from-navy-900 via-navy-800 to-accent-blue",
      tag: "Primary",
    },
    {
      id: "savings",
      label: "Share Savings",
      sublabel: "Primary Savings Account",
      balance: member.savingsBalance,
      account: member.savingsAccountNumber,
      icon: PiggyBank,
      gradient: "from-emerald-700 via-emerald-600 to-teal-600",
      tag: "5.00% APY",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Total Available Balance</p>
          <p className="text-2xl font-bold text-navy-900">
            {formatCurrency(total, hidden)}
          </p>
        </div>
        <button
          onClick={() => setHidden(!hidden)}
          className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-50"
          aria-label={hidden ? "Show balances" : "Hide balances"}
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {accounts.map((acc, i) => (
          <motion.div
            key={acc.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className={`overflow-hidden rounded-3xl border-0 bg-gradient-to-br ${acc.gradient} shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-white/15 p-2.5">
                    <acc.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
                    {acc.tag}
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium text-white/70">{acc.label}</p>
                <p className="text-xs text-white/50">{acc.sublabel}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                  {formatCurrency(acc.balance, hidden)}
                </p>
                <p className="mt-2 text-xs text-white/60">
                  {acc.label.split(" ")[0]} • {maskAccountNumber(acc.account)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}