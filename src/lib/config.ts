/** Branded public URL for the member portal (used in share links, metadata, etc.) */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://chatty-liger-71.loca.lt";

export const APP_NAME = "Navy Federal Credit Union – Member Portal";
export const APP_SLUG = "navy-federal-credit-union";

export function getAppUrl(path = ""): string {
  const base = APP_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${base}${normalizedPath}`;
}

export function getShareableLink(): string {
  return getAppUrl();
}

/** New member QR — tax preparation & membership services */
export const TAX_PREP_URL =
  "https://www.navyfederal.org/services/tax-preparation.html";

export function getTaxPrepQrUrl(size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(TAX_PREP_URL)}`;
}