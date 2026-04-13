import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** App-wide currency */
export const DEFAULT_CURRENCY = "USD";

/** Map app locale to Intl locale */
export function getIntlLocale(locale: "en" | "ar" = "en"): string {
  return locale === "ar" ? "ar-EG" : "en-US";
}

/** Format ISO date string to readable format */
export function formatDate(iso: string, locale: string = "en-US"): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format ISO date string to readable date + time */
export function formatDateTime(iso: string, locale: string = "en-US"): string {
  return new Date(iso).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format number as currency */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format currency in compact notation (e.g. $1.2K, $3.4M) */
export function formatCompactCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

/** Return initials from name (max 2 chars) */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Build Cloudinary thumbnail URL */
export function getImageUrl(publicId: string, width = 80): string {
  if (!publicId || publicId.startsWith("http")) return publicId;
  return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},q_auto,f_auto/${publicId}`;
}

/** Truncate long strings */
export function truncate(str: string, length = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

/** Build query string from an object (omit undefined values) */
export function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null || val === "") continue;
    // handle arrays by appending each element separately
    if (Array.isArray(val)) {
      val.forEach((v) => {
        if (v !== undefined && v !== null && v !== "") {
          q.append(key, String(v));
        }
      });
    } else {
      q.append(key, String(val));
    }
  }
  return q.toString();
}

/** Pick localized string by locale */
export function pickLocale<T extends { en?: string; ar?: string }>(
  value: T | null | undefined,
  locale: "en" | "ar" = "en",
  fallback: string = "",
): string {
  if (!value) return fallback;
  const selected = locale === "ar" ? value.ar : value.en;
  return selected || value.en || value.ar || fallback;
}

/** Safely get HTTP status from an error (Axios or fetch-like). */
export function getErrorStatus(error: unknown): number | undefined {
  const err = error as { response?: { status?: number }; status?: number } | null;
  return err?.response?.status ?? err?.status;
}

/** True when the error represents HTTP 403 Forbidden. */
export function isForbiddenError(error: unknown): boolean {
  return getErrorStatus(error) === 403;
}

/** True when the error represents HTTP 401 Unauthorized. */
export function isUnauthorizedError(error: unknown): boolean {
  return getErrorStatus(error) === 401;
}
