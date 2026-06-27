import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  variant?: "light" | "dark";
}

export function Logo({ className, size = "md", showText = true, variant = "dark" }: LogoProps) {
  const sizes = {
    sm: { icon: "h-8 w-8", text: "text-sm", sub: "text-[10px]" },
    md: { icon: "h-10 w-10", text: "text-base", sub: "text-xs" },
    lg: { icon: "h-12 w-12", text: "text-lg", sub: "text-xs" },
  };
  const s = sizes[size];
  const isLight = variant === "light";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl shadow-md",
          s.icon,
          isLight ? "bg-white/10 backdrop-blur" : "bg-navy-900"
        )}
      >
        <Shield className={cn("h-5 w-5", isLight ? "text-white" : "text-white")} />
      </div>
      {showText && (
        <div>
          <p className={cn("font-bold leading-tight", s.text, isLight ? "text-white" : "text-navy-900")}>
            Navy Federal
          </p>
          <p className={cn("font-medium uppercase tracking-wider", s.sub, isLight ? "text-white/70" : "text-slate-500")}>
            Credit Union
          </p>
        </div>
      )}
    </div>
  );
}