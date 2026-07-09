"use client";

import { motion } from "framer-motion";
import { TrendingUp, Shield, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMember } from "@/context/member-context";

function scoreTier(score: number): { label: string; color: string } {
  if (score >= 800) return { label: "Exceptional", color: "text-emerald-600" };
  if (score >= 740) return { label: "Very Good", color: "text-emerald-500" };
  if (score >= 670) return { label: "Good", color: "text-blue-600" };
  if (score >= 580) return { label: "Fair", color: "text-amber-600" };
  return { label: "Poor", color: "text-red-600" };
}

export function CreditScoreCard() {
  const { member } = useMember();
  const tier = scoreTier(member.creditScore);
  const pct = Math.min(100, Math.max(0, ((member.creditScore - 300) / 550) * 100));

  const factors = [
    { name: "Payment History", score: 98 },
    { name: "Credit Utilization", score: 92 },
    { name: "Account Age", score: 88 },
    { name: "Credit Mix", score: 85 },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-accent-blue" />
            Credit Score
          </CardTitle>
          <span className={`text-sm font-semibold ${tier.color}`}>{tier.label}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center sm:mx-0">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - pct / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0A2540" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <p className="text-3xl font-bold text-navy-900">{member.creditScore}</p>
              <p className="text-xs text-slate-400">FICO® Score</p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span>+12 points this month</span>
            </div>
            {factors.map((f) => (
              <div key={f.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-600">{f.name}</span>
                  <span className="font-semibold text-navy-900">{f.score}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-navy-800 to-accent-blue"
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="flex items-start gap-1.5 text-xs text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Updated monthly. Scores range from 300–850.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}