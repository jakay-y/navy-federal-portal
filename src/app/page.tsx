"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <Logo variant="light" />
          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            onClick={() => setAuthOpen(true)}
          >
            Sign In
          </Button>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80')`,
          }}
        />
        <div className="hero-gradient absolute inset-0" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent-blue/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-32 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
              <Shield className="h-4 w-4" />
              Trusted by 13+ million members
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Navy Federal Credit Union
              <span className="mt-2 block text-2xl font-medium text-white/80 sm:text-3xl">
                Member Portal
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
              Manage your accounts, send money, pay bills, and track every transaction —
              all in one secure, beautifully designed experience.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={() => setAuthOpen(true)}
                className="h-14 gap-2 rounded-2xl bg-white px-8 text-base text-navy-900 shadow-xl hover:bg-white/90 hover:shadow-2xl"
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
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex flex-col items-center gap-1 text-sm text-slate-400 sm:items-start">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              256-bit SSL secured · Navy Federal Credit Union © 2026
            </div>
            <a
              href={getShareableLink()}
              className="text-xs text-accent-blue hover:underline"
            >
              {getShareableLink()}
            </a>
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