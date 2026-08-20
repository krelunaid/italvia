import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-display text-2xl font-semibold tracking-tight",
          light ? "text-paper" : "text-navy",
        )}
      >
        ITALVIA
      </span>
    </Link>
  );
}
