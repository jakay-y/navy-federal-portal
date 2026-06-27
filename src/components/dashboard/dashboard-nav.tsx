"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMember } from "@/context/member-context";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "settings", label: "Settings" },
];

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  const router = useRouter();
  const { member, logout } = useMember();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "bg-navy-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-navy-900"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-slate-100">
                <Image
                  src={member.avatarUrl}
                  alt={`${member.firstName} ${member.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="hidden text-sm font-medium sm:inline">
                {member.firstName}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-navy-900">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-xs text-slate-400">{member.email}</p>
            </div>
            <DropdownMenuSeparator />
            {navItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="md:hidden"
                onClick={() => onTabChange(item.id)}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}