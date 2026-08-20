import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function firstName(displayName: string | null | undefined, fallback = "gościu") {
  if (!displayName) return fallback;
  const trimmed = displayName.trim();
  if (!trimmed) return fallback;
  return trimmed.split(/\s+/)[0] ?? fallback;
}

export function greetingPl(hour = new Date().getHours()) {
  if (hour < 12) return "Dzień dobry";
  if (hour < 18) return "Dzień dobry";
  return "Dobry wieczór";
}

export function greetingIt(hour = new Date().getHours()) {
  if (hour < 12) return "Buongiorno";
  if (hour < 18) return "Buon pomeriggio";
  return "Buonasera";
}
