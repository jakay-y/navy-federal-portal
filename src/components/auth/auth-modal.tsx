"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { OtpInput } from "@/components/auth/otp-input";
import { useMember } from "@/context/member-context";
import { formatPhoneLast4 } from "@/lib/format";
import { DEMO_OTP } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

type AuthStep = "login" | "otp" | "success";
type AuthTab = "login" | "new-member";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter();
  const { member, login } = useMember();
  const [tab, setTab] = useState<AuthTab>("login");
  const [step, setStep] = useState<AuthStep>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: member.email },
  });

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const onLoginSubmit = (data: LoginForm) => {
    if (data.email !== member.email || data.password !== member.password) {
      toast.error("Invalid credentials. Please check your email and password.");
      return;
    }
    setStep("otp");
    startCountdown();
    toast.success("Verification code sent to your phone.");
  };

  const handleOtpComplete = (code: string) => {
    setOtpVerifying(true);
    setTimeout(() => {
      if (code === DEMO_OTP) {
        setOtpError(false);
        setStep("success");
        login();
        toast.success("Identity verified successfully.");
        setTimeout(() => {
          onOpenChange(false);
          router.push("/dashboard");
        }, 1800);
      } else {
        setOtpError(true);
        toast.error("Invalid verification code. Please try again.");
      }
      setOtpVerifying(false);
    }, 600);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    startCountdown();
    toast.success("A new verification code has been sent.");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("login");
        setTab("login");
        setOtpError(false);
        setShowPassword(false);
      }, 300);
    }
    onOpenChange(isOpen);
  };

  const phoneLast4 = formatPhoneLast4(member.phone);

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

          {tab === "login" && step === "login" && (
            <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setTab("login")}
                className="flex-1 rounded-lg bg-white py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition-all"
              >
                Login
              </button>
              <button
                onClick={() => setTab("new-member")}
                className="flex-1 rounded-lg py-2.5 text-sm font-medium text-slate-500 transition-all hover:text-navy-900"
              >
                New Member
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {tab === "new-member" && (
              <motion.div
                key="new-member"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="mb-4 rounded-2xl bg-blue-50 p-6">
                  <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-accent-blue" />
                  <p className="text-sm leading-relaxed text-slate-600">
                    This account was created for you by our team. Please use the login
                    credentials shared with you.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setTab("login")} className="w-full">
                  Go to Login
                </Button>
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
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      placeholder="ciro.ballard@navyfederal.com"
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
                  {isSubmitting ? "Signing in..." : "Continue"}
                </Button>
              </motion.form>
            )}

            {tab === "login" && step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h3 className="mb-2 text-lg font-semibold text-navy-900">
                  Verify Your Identity
                </h3>
                <p className="mb-6 text-sm text-slate-500">
                  We sent a 6-digit code to your phone ending in{" "}
                  <span className="font-semibold text-navy-900">{phoneLast4}</span>
                </p>

                <OtpInput
                  onComplete={handleOtpComplete}
                  hasError={otpError}
                  disabled={otpVerifying}
                />

                {otpError && (
                  <p className="mt-3 text-sm text-red-500">
                    Incorrect code. Please try again.
                  </p>
                )}

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                  {countdown > 0 ? (
                    <span>Resend code in {countdown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="font-semibold text-accent-blue hover:underline"
                    >
                      Resend code
                    </button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  className="mt-4"
                  onClick={() => setStep("login")}
                >
                  Back to login
                </Button>
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