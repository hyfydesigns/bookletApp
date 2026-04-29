import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { getUnreadCount } from "@/actions/notifications";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (user.role === "admin") redirect("/admin/dashboard");
  if (!user.organizationId) redirect("/onboarding");

  const unreadCount = await getUnreadCount();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="organizer" orgName={user.organization?.name} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="BookletFlow" unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  );
}
