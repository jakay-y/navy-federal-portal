export function formatCurrency(amount: number, hidden = false): string {
  if (hidden) return "••••••";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function formatPhoneLast4(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-4);
}

export function generateReferenceNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `REF-${date}-${random}`;
}

export function maskAccountNumber(account: string): string {
  return `••••••${account.slice(-4)}`;
}