"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Fingerprint,
  Server,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { OtpInput } from "@/components/auth/otp-input";
import { NewMemberPanel } from "@/components/auth/new-member-panel";
import { useMember } from "@/context/member-context";
import { DEMO_ACCESS_PIN } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;
type AuthStep = "login" | "device-verify" | "pin" | "processing" | "success";
type AuthTab = "login" | "new-member";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VERIFY_STEPS = [
  "Validating credentials",
  "Checking device fingerprint",
  "Scanning for active threats",
  "Preparing secure session",
];

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter();
  const { member, login } = useMember();
  const [tab, setTab] = useState<AuthTab>("login");
  const [step, setStep] = useState<AuthStep>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [pinVerifying, setPinVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifyLabel, setVerifyLabel] = useState(VERIFY_STEPS[0]);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (step !== "device-verify") return;
    setVerifyProgress(0);
    setVerifyLabel(VERIFY_STEPS[0]);
    let stepIdx = 0;
    const interval = setInterval(() => {
      setVerifyProgress((p) => {
        const next = Math.min(p + 8, 100);
        if (next >= (stepIdx + 1) * 25 && stepIdx < VERIFY_STEPS.length - 1) {
          stepIdx += 1;
          setVerifyLabel(VERIFY_STEPS[stepIdx]);
        }
        return next;
      });
    }, 120);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setStep("pin");
      toast.info("Enter your secure access PIN to continue.");
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [step]);

  useEffect(() => {
    if (step !== "processing") return;
    const timeout = setTimeout(() => {
      setStep("success");
      login();
      toast.success("Secure session established.");
      setTimeout(() => {
        onOpenChange(false);
        router.push("/dashboard");
      }, 1600);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [step, login, onOpenChange, router]);

  const onLoginSubmit = (data: LoginForm) => {
    const emailMatch = data.email.trim().toLowerCase() === member.email.toLowerCase();
    if (!emailMatch || data.password !== member.password) {
      toast.error("Invalid credentials. Please check your email and password.");
      return;
    }
    setStep("device-verify");
    toast.success("Credentials verified. Running security checks...");
  };

  const handlePinComplete = (code: string) => {
    setPinVerifying(true);
    setTimeout(() => {
      if (code === DEMO_ACCESS_PIN || code === member.accessPin) {
        setPinError(false);
        setStep("processing");
      } else {
        setPinError(true);
        toast.error("Invalid access PIN. Please try again.");
      }
      setPinVerifying(false);
    }, 700);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("login");
        setTab("login");
        setPinError(false);
        setShowPassword(false);
        setVerifyProgress(0);
        resetForm({ email: "", password: "" });
      }, 300);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-0 p-0 overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-b from-slate-50 to-white p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo size="md" />
            <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              Secure Member Access
            </p>
          </div>

          {step === "login" && (
            <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setTab("login")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  tab === "login"
                    ? "bg-white text-navy-900 shadow-sm"
                    : "text-slate-500 hover:text-navy-900"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setTab("new-member")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  tab === "new-member"
                    ? "bg-white text-navy-900 shadow-sm font-semibold"
                    : "text-slate-500 hover:text-navy-900"
                }`}
              >
                New Member
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {tab === "new-member" && step === "login" && (
              <motion.div
                key="new-member"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <NewMemberPanel onGoToLogin={() => setTab("login")} />
              </motion.div>
            )}

            {tab === "login" && step === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit(onLoginSubmit)}
                className="space-y-4"
                autoComplete="off"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      placeholder="Enter your email address"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toast.info("Password reset link sent to your registered email.")
                  }
                  className="text-sm font-medium text-accent-blue hover:underline"
                >
                  Forgot password?
                </button>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Continue"}
                </Button>
              </motion.form>
            )}

            {tab === "login" && step === "device-verify" && (
              <motion.div
                key="device-verify"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-4 text-center"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <Fingerprint className="h-8 w-8 text-accent-blue" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900">Security Verification</h3>
                <p className="mt-2 text-sm text-slate-500">{verifyLabel}...</p>
                <div className="mx-auto mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-navy-800 to-accent-blue"
                    animate={{ width: `${verifyProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>
            )}

            {tab === "login" && step === "pin" && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-900/5">
                  <ShieldCheck className="h-7 w-7 text-navy-900" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-navy-900">
                  Enter Secure Access PIN
                </h3>
                <p className="mb-6 text-sm text-slate-500">
                  Enter your 6-digit member PIN to authorize dashboard access.
                </p>

                <OtpInput
                  length={6}
                  onComplete={handlePinComplete}
                  hasError={pinError}
                  disabled={pinVerifying}
                />

                {pinError && (
                  <p className="mt-3 text-sm text-red-500">
                    Incorrect PIN. Please try again.
                  </p>
                )}

                <Button
                  variant="ghost"
                  className="mt-6"
                  onClick={() => setStep("login")}
                >
                  Back to login
                </Button>
              </motion.div>
            )}

            {tab === "login" && step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <Server className="h-8 w-8 text-accent-blue" />
                </div>
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-navy-900" />
                <h3 className="text-lg font-semibold text-navy-900">
                  Establishing Secure Session
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Encrypting connection and loading your accounts...
                </p>
              </motion.div>
            )}

            {tab === "login" && step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-navy-900">
                  Welcome back, {member.firstName}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Redirecting to your dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}