"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
  xl: "h-28 w-28 text-3xl",
};

export function ProfileAvatar({
  firstName,
  lastName,
  avatarUrl,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  const hasPhoto = avatarUrl && avatarUrl.length > 0;

  if (hasPhoto && avatarUrl.startsWith("data:")) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl ring-2 ring-slate-100",
          sizeMap[size],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={`${firstName} ${lastName}`} className="h-full w-full object-cover" />
      </div>
    );
  }

  if (hasPhoto) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl ring-2 ring-slate-100",
          sizeMap[size],
          className
        )}
      >
        <Image
          src={avatarUrl}
          alt={`${firstName} ${lastName}`}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-accent-blue font-bold text-white ring-2 ring-slate-100",
        sizeMap[size],
        className
      )}
      aria-label={`${firstName} ${lastName} profile`}
    >
      {initials}
    </div>
  );
}