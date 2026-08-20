import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-faint",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40",
        className,
      )}
      {...props}
    />
  );
}
