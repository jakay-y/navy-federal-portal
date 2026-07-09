import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LOGO_SRC = "/images/nfcu-logo.jpg";

export function Logo({ className, size = "md" }: LogoProps) {
  const heights = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <div className={cn("flex shrink-0 items-center", className)}>
      <Image
        src={LOGO_SRC}
        alt="Navy Federal Credit Union"
        width={320}
        height={64}
        priority
        className={cn("w-auto object-contain", heights[size])}
      />
    </div>
  );
}