import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function generateAdCode(sequence: number) {
  return `AD-${String(sequence).padStart(4, "0")}`;
}

export function calcBookletProgress(
  totalPages: number,
  frontSectionPages: number,
  fullPageAds: number,
  halfPageAds: number
) {
  const adPagesAvailable = totalPages - frontSectionPages;
  const adPagesUsed = fullPageAds + Math.ceil(halfPageAds / 2);
  const adPagesRemaining = Math.max(0, adPagesAvailable - adPagesUsed);
  const completionPercent =
    adPagesAvailable > 0
      ? Math.min(100, Math.round((adPagesUsed / adPagesAvailable) * 100))
      : 0;
  return { adPagesAvailable, adPagesUsed, adPagesRemaining, completionPercent };
}

export function getAdPrice(adType: "full_page" | "half_page") {
  return adType === "full_page" ? 100 : 50;
}
