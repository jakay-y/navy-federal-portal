"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  TrendingUp,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMember } from "@/context/member-context";
import { MARKET_STOCK_CATALOG } from "@/lib/seed-data";
import { formatCurrency, maskAccountNumber } from "@/lib/format";
import type { AccountType } from "@/lib/types";

interface BuyStocksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = ["Account", "Stock", "Review", "Processing", "Complete"] as const;

export function BuyStocksModal({ open, onOpenChange }: BuyStocksModalProps) {
  const { member, buyStock } = useMember();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>("checking");
  const [ticker, setTicker] = useState(MARKET_STOCK_CATALOG[0].ticker);
  const [quantity, setQuantity] = useState("");
  const [resultBalance, setResultBalance] = useState(0);

  const selectedStock = MARKET_STOCK_CATALOG.find((s) => s.ticker === ticker)!;
  const qty = parseInt(quantity, 10) || 0;
  const totalCost = Math.round(selectedStock.price * qty * 100) / 100;

  const accountBalance = useMemo(
    () =>
      accountType === "checking" ? member.checkingBalance : member.savingsBalance,
    [accountType, member.checkingBalance, member.savingsBalance]
  );

  const accountNumber =
    accountType === "checking" ? member.accountNumber : member.savingsAccountNumber;

  const reset = () => {
    setStep(0);
    setAccountType("checking");
    setTicker(MARKET_STOCK_CATALOG[0].ticker);
    setQuantity("");
    setResultBalance(0);
  };

  const handleClose = (v: boolean) => {
    if (!v) setTimeout(reset, 300);
    onOpenChange(v);
  };

  const canProceedStock = qty > 0 && totalCost > 0 && totalCost <= accountBalance;

  const handleConfirm = () => {
    if (!canProceedStock) {
      toast.error("Insufficient funds or invalid quantity.");
      return;
    }
    setStep(3);
    setTimeout(() => {
      try {
        const { newBalance } = buyStock({
          ticker: selectedStock.ticker,
          name: selectedStock.name,
          shares: qty,
          pricePerShare: selectedStock.price,
          accountType,
        });
        setResultBalance(newBalance);
        setStep(4);
        toast.success("Stock purchase completed successfully.");
      } catch (e) {
        setStep(2);
        toast.error(e instanceof Error ? e.message : "Purchase failed.");
      }
    }, 1800);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent-blue" />
            Buy Stocks
          </DialogTitle>
          <div className="flex gap-1 pt-2">
            {STEPS.slice(0, 3).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-navy-900" : "bg-slate-100"}`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Step {Math.min(step + 1, 3)} of 3 — {STEPS[Math.min(step, 2)]}
          </p>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Select the account to debit for this stock purchase.
            </p>
            {(["checking", "savings"] as AccountType[]).map((acc) => {
              const bal = acc === "checking" ? member.checkingBalance : member.savingsBalance;
              const num = acc === "checking" ? member.accountNumber : member.savingsAccountNumber;
              return (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setAccountType(acc)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                    accountType === acc
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
            <Button className="w-full gap-2" onClick={() => setStep(1)}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="h-4 w-4" />
                <span>
                  {member.firstName} {member.lastName} · {member.email}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Stock</Label>
              <select
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-navy-900 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20"
              >
                {MARKET_STOCK_CATALOG.map((s) => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.ticker} — {s.name} ({formatCurrency(s.price)}/share)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Quantity (shares)</Label>
              <Input
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Price per share</span>
                <span className="font-medium">{formatCurrency(selectedStock.price)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-slate-500">Total cost</span>
                <span className="text-xl font-bold text-navy-900">
                  {qty > 0 ? formatCurrency(totalCost) : "—"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Available in {accountType}: {formatCurrency(accountBalance)}
              </p>
              {qty > 0 && totalCost > accountBalance && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Insufficient funds in selected account.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-1" onClick={() => setStep(0)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                className="flex-1"
                disabled={!canProceedStock}
                onClick={() => setStep(2)}
              >
                Review Purchase
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-sm">
              <Row label="Account holder" value={`${member.firstName} ${member.lastName}`} />
              <Row label="Debiting" value={`${accountType} • ${maskAccountNumber(accountNumber)}`} />
              <Row label="Current balance" value={formatCurrency(accountBalance)} />
              <Row label="Stock" value={`${selectedStock.ticker} — ${selectedStock.name}`} />
              <Row label="Shares" value={String(qty)} />
              <Row label="Price / share" value={formatCurrency(selectedStock.price)} />
              <Row label="Total cost" value={formatCurrency(totalCost)} highlight />
              <Row
                label="Balance after purchase"
                value={formatCurrency(accountBalance - totalCost)}
                highlight
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Confirm Purchase
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center py-8 text-center">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-navy-900" />
            <p className="font-semibold text-navy-900">Processing Stock Purchase</p>
            <p className="mt-2 text-sm text-slate-500">
              Executing trade and updating your portfolio...
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-600" />
            <p className="text-lg font-semibold text-navy-900">Purchase Complete</p>
            <p className="mt-2 text-sm text-slate-500">
              {qty} shares of {selectedStock.ticker} added to your portfolio.
            </p>
            <p className="mt-3 text-sm">
              <span className="text-slate-500">New {accountType} balance: </span>
              <span className="font-bold text-emerald-600">{formatCurrency(resultBalance)}</span>
            </p>
            <Button className="mt-6 w-full" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
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