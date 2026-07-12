import type { TransactionStatus } from "./types";

export function statusBadgeVariant(
  status: TransactionStatus
): "success" | "warning" | "destructive" | "secondary" {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
    case "on_hold":
      return "warning";
    case "failed":
    case "declined":
      return "destructive";
    default:
      return "secondary";
  }
}

export function statusLabel(status: TransactionStatus): string {
  switch (status) {
    case "on_hold":
      return "On Hold";
    case "pending":
      return "Pending";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "declined":
      return "Declined";
    default:
      return status;
  }
}