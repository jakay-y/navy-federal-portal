"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { HeroSlideshow } from "@/components/landing/hero-slideshow";
import { getShareableLink } from "@/lib/config";

const features = [
  "256-bit SSL encryption",
  "Real-time transaction monitoring",
  "FDIC insured deposits",
  "24/7 member support",
];

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo size="md" />
          <Button
            variant="outline"
            className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/20"
            onClick={() => setAuthOpen(true)}
          >
            Sign In
          </Button>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center overflow-hidden">
        <HeroSlideshow />
        <div className="hero-gradient absolute inset-0 z-[3]" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-32 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-white/90" />
              Trusted by 13+ million members
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Navy Federal Credit Union
              <span className="mt-3 block text-xl font-medium text-white/85 sm:text-2xl">
                Banking built for those who serve
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
              Manage your accounts, send money, pay bills, and track every transaction —
              all in one secure, beautifully designed experience.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={() => setAuthOpen(true)}
                className="h-14 gap-2 rounded-2xl bg-white px-8 text-base text-navy-900 shadow-xl hover:bg-white/95 hover:shadow-2xl"
              >
                Access Your Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-white/75"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-white/70" />
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <Logo size="sm" />
            <div className="flex flex-col items-center gap-1 text-sm text-slate-400 sm:items-start">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                256-bit SSL secured · © 2026
              </div>
              <a
                href={getShareableLink()}
                className="text-xs text-navy-800 hover:underline"
              >
                {getShareableLink()}
              </a>
            </div>
          </div>
          <Link
            href="/admin"
            className="text-xs text-slate-400 transition-colors hover:text-navy-900"
          >
            Administrator Access
          </Link>
        </div>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}