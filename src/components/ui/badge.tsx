import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "sand",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "sand" | "sage" | "navy" | "danger" | "terracotta" }) {
  const tones = {
    sand: "bg-ivory-deep text-navy",
    sage: "bg-sage-soft text-sage",
    navy: "bg-navy text-paper",
    danger: "bg-danger-soft text-danger",
    terracotta: "bg-terracotta/12 text-terracotta-deep",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
