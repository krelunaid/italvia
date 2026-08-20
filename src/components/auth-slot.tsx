import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { firstName } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

export function AuthSlot({ light = false }: { light?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  const { t } = useLang();
  if (isPending) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-ivory-deep" />;
  }
  if (!user) {
    return (
      <Link
        to="/login"
        className={
          light
            ? "rounded-md border border-paper/40 bg-navy/45 px-3 py-2 text-sm text-paper backdrop-blur-sm"
            : "rounded-md bg-navy px-3 py-2 text-sm text-paper"
        }
      >
        {t("signIn")}
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="" className="size-9 rounded-full object-cover" />
      ) : (
        <span className="grid size-9 place-items-center rounded-full bg-navy text-sm text-paper">
          {firstName(user.displayName, "I").charAt(0).toUpperCase()}
        </span>
      )}
      <button
        type="button"
        onClick={() => void signOut("/")}
        className={light ? "text-xs text-paper/80" : "text-xs text-muted"}
      >
        {t("signOut")}
      </button>
    </div>
  );
}
