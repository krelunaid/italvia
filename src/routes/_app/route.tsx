import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BuyerNav } from "@/components/buyer-nav";
import { LiveBanner } from "@/components/live-banner";

export const Route = createFileRoute("/_app")({
  component: BuyerLayout,
});

function BuyerLayout() {
  return (
    <div className="min-h-dvh bg-ivory pb-24">
      <LiveBanner />
      <Outlet />
      <BuyerNav />
    </div>
  );
}