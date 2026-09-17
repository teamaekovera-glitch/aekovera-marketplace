import { RoleSidebar } from "@/components/layout/role-sidebar";
import { getRequiredUser } from "@/lib/session";

/**
 * Shared layout shell (F-15): sidebar navigation rendering per role
 * (brand / buyer / admin), with the page content beside it.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate>{children}</RoleGate>;
}

async function RoleGate({ children }: { children: React.ReactNode }) {
  const user = await getRequiredUser();
  return (
    <div className="flex min-h-screen">
      <RoleSidebar role={user.role} />
      <main id="main-content" className="flex-1 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
