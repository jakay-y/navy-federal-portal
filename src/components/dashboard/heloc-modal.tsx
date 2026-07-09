"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Home, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMember } from "@/context/member-context";
import { formatCurrency } from "@/lib/format";

const schema = z.object({
  propertyValue: z.string().min(1, "Property value required"),
  requestedAmount: z.string().min(1, "Requested amount required"),
  propertyAddress: z.string().min(5, "Property address required"),
  annualIncome: z.string().min(1, "Annual income required"),
});

type FormData = z.infer<typeof schema>;

interface HelocModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelocModal({ open, onOpenChange }: HelocModalProps) {
  const { member, updateMemberProfile } = useMember();
  const [step, setStep] = useState<"form" | "processing" | "done">("form");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyAddress: `${member.street}, ${member.city}, ${member.state} ${member.zip}`,
    },
  });

  const onSubmit = handleSubmit((data) => {
    setStep("processing");
    setTimeout(() => {
      updateMemberProfile({
        heloc: {
          status: "under_review",
          requestedAmount: parseFloat(data.requestedAmount),
          propertyValue: parseFloat(data.propertyValue),
          submittedAt: new Date().toISOString(),
        },
      });
      setStep("done");
      toast.success("HELOC application submitted successfully.");
    }, 2200);
  });

  const handleClose = (v: boolean) => {
    if (!v) {
      setTimeout(() => setStep("form"), 300);
    }
    onOpenChange(v);
  };

  const helocStatus = member.heloc?.status ?? "none";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-accent-blue" />
            Apply for HELOC
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Home Equity Line of Credit — competitive rates for eligible members.
          </p>
        </DialogHeader>

        {helocStatus !== "none" && helocStatus !== "draft" && step === "form" ? (
          <div className="rounded-2xl bg-blue-50 p-5 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-accent-blue" />
            <p className="font-semibold text-navy-900">Application {helocStatus.replace("_", " ")}</p>
            {member.heloc.requestedAmount && (
              <p className="mt-2 text-sm text-slate-600">
                Requested: {formatCurrency(member.heloc.requestedAmount)}
              </p>
            )}
            <Button variant="outline" className="mt-4 w-full" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : step === "form" ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Property Address</Label>
              <Input {...register("propertyAddress")} />
              {errors.propertyAddress && <p className="text-xs text-red-500">{errors.propertyAddress.message}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Estimated Property Value ($)</Label>
                <Input type="number" step="1000" placeholder="450000" {...register("propertyValue")} />
                {errors.propertyValue && <p className="text-xs text-red-500">{errors.propertyValue.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Requested Line Amount ($)</Label>
                <Input type="number" step="1000" placeholder="100000" {...register("requestedAmount")} />
                {errors.requestedAmount && <p className="text-xs text-red-500">{errors.requestedAmount.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Annual Household Income ($)</Label>
              <Input type="number" step="1000" placeholder="95000" {...register("annualIncome")} />
              {errors.annualIncome && <p className="text-xs text-red-500">{errors.annualIncome.message}</p>}
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              Subject to credit approval. Rates as low as 7.25% APR. No application fee for qualified members.
            </div>
            <Button type="submit" className="w-full">Submit Application</Button>
          </form>
        ) : step === "processing" ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-navy-900" />
            <p className="font-medium text-navy-900">Reviewing your application...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-600" />
            <p className="font-semibold text-navy-900">Application Received</p>
            <p className="mt-2 text-sm text-slate-500">
              A loan officer will contact you within 2 business days.
            </p>
            <Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}