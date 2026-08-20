import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/desk/homes")({
  component: () => <Outlet />,
});
