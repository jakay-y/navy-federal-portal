"use client";

import { FileText, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTaxPrepQrUrl, TAX_PREP_URL } from "@/lib/config";

interface NewMemberPanelProps {
  onGoToLogin: () => void;
}

export function NewMemberPanel({ onGoToLogin }: NewMemberPanelProps) {
  return (
    <div className="text-center">
      <div className="mb-5 flex items-center justify-center gap-2">
        <QrCode className="h-5 w-5 text-accent-blue" />
        <h3 className="text-lg font-semibold text-navy-900">New Member Services</h3>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-slate-600">
        Scan the code below to access tax preparation services, membership enrollment,
        and financial planning resources.
      </p>

      <div className="mx-auto mb-4 inline-flex rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getTaxPrepQrUrl(180)}
          alt="QR code for Navy Federal tax preparation services"
          width={180}
          height={180}
          className="rounded-lg"
        />
      </div>

      <p className="mb-4 text-xs font-medium text-slate-400">
        Scan with your phone camera
      </p>

      <a
        href={TAX_PREP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-accent-blue transition-colors hover:bg-blue-100"
      >
        <FileText className="h-4 w-4" />
        Tax Preparation Services
        <ExternalLink className="h-3.5 w-3.5" />
      </a>

      <Button variant="outline" onClick={onGoToLogin} className="w-full">
        Already a member? Sign In
      </Button>
    </div>
  );
}