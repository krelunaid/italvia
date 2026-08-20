import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/offers")({
  component: () => <Outlet />,
});
