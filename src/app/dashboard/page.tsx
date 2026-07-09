"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { InvestmentsTab } from "@/components/dashboard/investments-tab";
import { TransactionsTab } from "@/components/dashboard/transactions-tab";
import { SettingsTab } from "@/components/dashboard/settings-tab";
import { ReceiptModal } from "@/components/dashboard/receipt-modal";
import { useMember } from "@/context/member-context";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated, transactions } = useMember();
  const [activeTab, setActiveTab] = useState("overview");
  const [receiptTxnId, setReceiptTxnId] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push("/");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-900 border-t-transparent" />
      </div>
    );
  }

  const receiptTransaction = transactions.find((t) => t.id === receiptTxnId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {activeTab === "overview" && (
          <OverviewTab
            onViewAllTransactions={() => setActiveTab("transactions")}
            onViewReceipt={setReceiptTxnId}
            onViewInvestments={() => setActiveTab("investments")}
          />
        )}
        {activeTab === "investments" && <InvestmentsTab />}
        {activeTab === "transactions" && (
          <TransactionsTab onViewReceipt={setReceiptTxnId} />
        )}
        {activeTab === "settings" && <SettingsTab />}
      </main>

      <ReceiptModal
        transaction={receiptTransaction}
        open={!!receiptTxnId}
        onOpenChange={(open) => !open && setReceiptTxnId(null)}
      />
    </div>
  );
}