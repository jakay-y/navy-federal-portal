"use client";

import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { StockHolding } from "@/lib/types";

type Range = "1W" | "1M" | "3M";

interface StockChartModalProps {
  stock: StockHolding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateHistory(price: number, pctChange: number, points: number): number[] {
  const end = price;
  const start = price / (1 + pctChange / 100);
  const values: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const wave = Math.sin(i * 0.55 + price * 0.01) * price * 0.018;
    values.push(Math.round((start + (end - start) * t + wave) * 100) / 100);
  }
  values[values.length - 1] = end;
  return values;
}

function rangePoints(range: Range): number {
  switch (range) {
    case "1W": return 7;
    case "1M": return 30;
    case "3M": return 90;
  }
}

export function StockChartModal({ stock, open, onOpenChange }: StockChartModalProps) {
  const [range, setRange] = useState<Range>("1M");

  const history = useMemo(() => {
    if (!stock) return [];
    return generateHistory(stock.price, stock.pctChange, rangePoints(range));
  }, [stock, range]);

  if (!stock) return null;

  const min = Math.min(...history);
  const max = Math.max(...history);
  const span = max - min || 1;
  const isUp = stock.change >= 0;

  const width = 320;
  const height = 140;
  const padding = 8;

  const points = history
    .map((v, i) => {
      const x = padding + (i / (history.length - 1)) * (width - padding * 2);
      const y = height - padding - ((v - min) / span) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900/5 text-sm font-bold text-navy-900">
              {stock.ticker.slice(0, 2)}
            </span>
            <div>
              <p>{stock.ticker}</p>
              <p className="text-sm font-normal text-slate-500">{stock.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-navy-900">{formatCurrency(stock.price)}</p>
            <div className="mt-1 flex items-center gap-2">
              {isUp ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${isUp ? "text-emerald-600" : "text-red-600"}`}>
                {isUp ? "+" : ""}
                {stock.change.toFixed(2)} ({isUp ? "+" : ""}
                {stock.pctChange.toFixed(2)}%)
              </span>
            </div>
          </div>
          <Badge variant="secondary">{stock.shares} shares held</Badge>
        </div>

        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(["1W", "1M", "3M"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                range === r ? "bg-white text-navy-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity="0.25" />
                <stop offset="100%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#chartFill)" />
            <polyline
              points={points}
              fill="none"
              stroke={isUp ? "#059669" : "#dc2626"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Low {formatCurrency(min)}</span>
            <span>High {formatCurrency(max)}</span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Market trend chart · {range} view · For illustrative purposes
        </p>
      </DialogContent>
    </Dialog>
  );
}