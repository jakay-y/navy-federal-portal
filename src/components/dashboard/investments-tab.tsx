"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuyStocksModal } from "@/components/dashboard/buy-stocks-modal";
import { useMember } from "@/context/member-context";
import { formatCurrency } from "@/lib/format";

export function InvestmentsTab() {
  const { stocks } = useMember();
  const [buyOpen, setBuyOpen] = useState(false);

  const portfolioValue = stocks.reduce((sum, s) => sum + s.price * s.shares, 0);
  const dayChange = stocks.reduce((sum, s) => sum + s.change * s.shares, 0);
  const dayChangePct = portfolioValue > 0 ? (dayChange / portfolioValue) * 100 : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-navy-900 via-navy-800 to-accent-blue shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 p-3">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Portfolio Value</p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(portfolioValue)}</p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setBuyOpen(true)}
                className="gap-2 bg-white text-navy-900 hover:bg-white/95"
              >
                <Plus className="h-5 w-5" />
                Buy Stocks
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {dayChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-300" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300" />
              )}
              <span className={`text-sm font-medium ${dayChange >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                {dayChange >= 0 ? "+" : ""}
                {formatCurrency(dayChange)} ({dayChangePct >= 0 ? "+" : ""}
                {dayChangePct.toFixed(2)}%) today
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>Your Navy Federal investment portfolio</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setBuyOpen(true)}>
            <Plus className="h-4 w-4" />
            Buy
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {stocks.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No holdings yet. Tap Buy Stocks to start investing.
            </p>
          ) : (
            stocks.map((stock, i) => {
              const value = stock.price * stock.shares;
              const isUp = stock.change >= 0;
              return (
                <motion.div
                  key={stock.ticker}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900/5 text-sm font-bold text-navy-900">
                      {stock.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">{stock.ticker}</p>
                      <p className="text-xs text-slate-400">{stock.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{stock.shares} shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy-900">{formatCurrency(value)}</p>
                    <Badge variant={isUp ? "success" : "destructive"} className="mt-1">
                      {isUp ? "+" : ""}
                      {stock.pctChange.toFixed(2)}%
                    </Badge>
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>

      <BuyStocksModal open={buyOpen} onOpenChange={setBuyOpen} />
    </div>
  );
}