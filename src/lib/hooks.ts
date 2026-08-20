import { useQuery } from "@tanstack/react-query";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyProfile, listCompare, listFavorites } from "@/lib/server/italvia";
import type { BuyerProfile } from "@/lib/score";

export function useSessionGate() {
  return useCurrentUserState();
}

export function useProfile() {
  const { user, isPending } = useCurrentUserState();
  const q = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getMyProfile(),
    enabled: Boolean(user),
  });
  return { user, authPending: isPending, profile: q.data ?? null, loading: isPending || q.isPending };
}

export function useFavorites() {
  const { user } = useCurrentUserState();
  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => listFavorites(),
    enabled: Boolean(user),
  });
}

export function useCompare() {
  const { user } = useCurrentUserState();
  return useQuery({
    queryKey: ["compare", user?.id],
    queryFn: () => listCompare(),
    enabled: Boolean(user),
  });
}

export function asBuyerProfile(profile: ReturnType<typeof useProfile>["profile"]): BuyerProfile | null {
  if (!profile) return null;
  return {
    purpose: profile.purpose,
    budgetEur: profile.budgetEur,
    cashAvailableEur: profile.cashAvailableEur,
    financing: profile.financing,
    setting: profile.setting,
    condition: profile.condition,
    preferredAirport: profile.preferredAirport,
    polishCity: profile.polishCity,
    visitPeriods: profile.visitPeriods,
    rentalInterest: profile.rentalInterest,
    minRooms: profile.minRooms,
    wantsTerrace: profile.wantsTerrace,
    seaMaxKm: profile.seaMaxKm,
  };
}
